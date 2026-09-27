-- =====================================================================
-- FARUM · Esquema de la tienda (catálogo, pedidos, rate limiting)
--
-- Todos los montos son pesos chilenos (CLP) ENTEROS, con IVA incluido.
-- NUNCA se guardan datos de tarjeta: Transbank los maneja por completo.
--
-- Este archivo crea tablas y funciones. Las políticas RLS y los permisos
-- están en 20260926000002_rls.sql (deben aplicarse en el mismo despliegue).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  nombre      text not null check (length(nombre) between 2 and 80),
  descripcion text check (descripcion is null or length(descripcion) <= 500),
  orden       integer not null default 0,
  -- 'venta'   → productos con precio, carrito y checkout.
  -- 'cotizar' → servicios: sin carrito ni precio, botón "Cotizar" (WhatsApp).
  modo        text not null default 'venta' check (modo in ('venta', 'cotizar')),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Productos y servicios
-- ---------------------------------------------------------------------
create table public.products (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references public.categories (id) on delete restrict,
  nombre         text not null check (length(nombre) between 2 and 120),
  descripcion    text check (descripcion is null or length(descripcion) <= 1000),
  -- Nullable: un producto "próximamente" no tiene precio todavía.
  precio         integer check (precio is null or precio > 0),
  sku            text unique check (sku is null or length(sku) <= 40),
  imagen_url     text check (imagen_url is null or length(imagen_url) <= 500),
  activo         boolean not null default true,
  estado         text not null default 'proximamente'
                 check (estado in ('proximamente', 'disponible')),
  -- null = sin control de stock (se puede vender siempre).
  stock          integer check (stock is null or stock >= 0),
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);

-- Regla de negocio en la base de datos (no solo en el formulario): un
-- producto de una categoría de venta no puede pasar a "disponible" sin
-- precio. Así "activar un producto" es solo cargar sus datos.
create function public.products_enforce_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_modo text;
begin
  new.actualizado_en := now();

  select c.modo into v_modo from public.categories c where c.id = new.category_id;

  if new.estado = 'disponible' and v_modo = 'venta' and new.precio is null then
    raise exception 'Un producto disponible de una categoría de venta requiere precio'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger products_enforce_rules
  before insert or update on public.products
  for each row execute function public.products_enforce_rules();

-- ---------------------------------------------------------------------
-- Pedidos (checkout como invitado: sin cuentas de cliente)
-- ---------------------------------------------------------------------
create table public.orders (
  id                           uuid primary key default gen_random_uuid(),
  -- Número legible para el cliente y el admin.
  numero                       bigint generated always as identity,
  -- Identificador no adivinable para la página pública de confirmación.
  public_token                 uuid not null unique default gen_random_uuid(),
  creado_en                    timestamptz not null default now(),
  pagado_en                    timestamptz,
  estado                       text not null default 'pendiente'
                               check (estado in ('pendiente', 'pagado', 'fallido', 'despachado')),
  nombre_cliente               text not null check (length(nombre_cliente) between 2 and 100),
  email                        text not null check (length(email) between 5 and 254),
  telefono                     text not null check (length(telefono) between 8 and 20),
  direccion                    text not null check (length(direccion) between 5 and 200),
  comuna                       text not null check (length(comuna) between 2 and 80),
  notas                        text check (notas is null or length(notas) <= 500),
  total                        integer not null check (total > 0),
  -- Solo identificadores de Transbank. Ningún dato de tarjeta.
  transbank_token              text unique,
  transbank_order_id           text not null unique,
  transbank_authorization_code text
);

create index orders_estado_creado_idx on public.orders (estado, creado_en desc);
create index orders_email_idx on public.orders (email);

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      uuid not null references public.products (id) on delete restrict,
  -- Copia del nombre al momento de la compra (el historial no cambia si
  -- después se renombra el producto).
  nombre_producto text not null,
  cantidad        integer not null check (cantidad between 1 and 999),
  precio_unitario integer not null check (precio_unitario > 0)
);

create index order_items_order_idx on public.order_items (order_id);

-- Un admin autenticado solo puede mover un pedido entre "pagado" y
-- "despachado". Los estados de pago (pendiente/pagado/fallido) los decide
-- únicamente Transbank a través del servidor (service_role).
create function public.orders_guard_estado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.estado is distinct from old.estado
     and (select auth.role()) = 'authenticated'
     and not ((old.estado = 'pagado' and new.estado = 'despachado')
           or (old.estado = 'despachado' and new.estado = 'pagado')) then
    raise exception 'Transición de estado no permitida: % -> %', old.estado, new.estado
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger orders_guard_estado
  before update on public.orders
  for each row execute function public.orders_guard_estado();

-- ---------------------------------------------------------------------
-- Rate limiting (contadores por ventana fija)
-- ---------------------------------------------------------------------
create table public.rate_limits (
  bucket       text not null,
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);

-- ---------------------------------------------------------------------
-- Es admin? (claim en app_metadata)
--
-- app_metadata solo lo puede modificar el dashboard de Supabase o el
-- service_role: un usuario NO puede auto-asignarse el rol desde el
-- navegador (a diferencia de user_metadata).
-- ---------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select (select auth.role()) = 'authenticated'
     and coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ---------------------------------------------------------------------
-- Crear pedido: TODO se valida y se calcula acá, en la base de datos.
--
-- El servidor solo manda qué producto y cuántas unidades. El precio, el
-- nombre y el total salen de las tablas reales dentro de una sola
-- transacción: nada de lo que envíe el navegador puede alterar el monto.
-- ---------------------------------------------------------------------
create function public.fn_create_order(
  p_nombre    text,
  p_email     text,
  p_telefono  text,
  p_direccion text,
  p_comuna    text,
  p_notas     text,
  p_items     jsonb
)
returns table (
  order_id           uuid,
  public_token       uuid,
  transbank_order_id text,
  total              integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item       record;
  v_product    record;
  v_total      bigint := 0;
  v_order_id   uuid;
  v_public     uuid;
  v_buy_order  text;
  v_lines      jsonb := '[]'::jsonb;
begin
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'CART_INVALID' using errcode = 'P0001';
  end if;

  -- Une líneas repetidas del mismo producto y valida cantidades.
  for v_item in
    select (e ->> 'product_id')::uuid as product_id,
           sum((e ->> 'cantidad')::integer) as cantidad
      from jsonb_array_elements(p_items) e
     group by 1
  loop
    if v_item.cantidad < 1 or v_item.cantidad > 999 then
      raise exception 'CART_INVALID' using errcode = 'P0001';
    end if;

    select p.id, p.nombre, p.precio, p.stock, p.activo, p.estado,
           c.modo, c.activo as categoria_activa
      into v_product
      from public.products p
      join public.categories c on c.id = p.category_id
     where p.id = v_item.product_id;

    if not found
       or not v_product.activo
       or not v_product.categoria_activa
       or v_product.estado <> 'disponible'
       or v_product.modo <> 'venta'
       or v_product.precio is null then
      raise exception 'PRODUCT_UNAVAILABLE:%', v_item.product_id using errcode = 'P0001';
    end if;

    if v_product.stock is not null and v_product.stock < v_item.cantidad then
      raise exception 'OUT_OF_STOCK:%', v_item.product_id using errcode = 'P0001';
    end if;

    v_total := v_total + (v_product.precio::bigint * v_item.cantidad);

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'nombre',     v_product.nombre,
      'cantidad',   v_item.cantidad,
      'precio',     v_product.precio
    );
  end loop;

  -- Tope de cordura (evita montos absurdos por error de carga de precios).
  if v_total < 1 or v_total > 20000000 then
    raise exception 'TOTAL_OUT_OF_RANGE' using errcode = 'P0001';
  end if;

  -- buy_order de Transbank: máx. 26 caracteres, único.
  v_buy_order := 'FRM' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  insert into public.orders (
    nombre_cliente, email, telefono, direccion, comuna, notas,
    total, transbank_order_id
  )
  values (
    p_nombre, p_email, p_telefono, p_direccion, p_comuna, nullif(p_notas, ''),
    v_total::integer, v_buy_order
  )
  returning id, orders.public_token into v_order_id, v_public;

  insert into public.order_items (order_id, product_id, nombre_producto, cantidad, precio_unitario)
  select v_order_id,
         (l ->> 'product_id')::uuid,
         l ->> 'nombre',
         (l ->> 'cantidad')::integer,
         (l ->> 'precio')::integer
    from jsonb_array_elements(v_lines) l;

  return query select v_order_id, v_public, v_buy_order, v_total::integer;
end;
$$;

-- ---------------------------------------------------------------------
-- Confirmar pago: idempotente. Marca "pagado" y descuenta stock en la
-- misma transacción. Devuelve true solo la primera vez.
-- ---------------------------------------------------------------------
create function public.fn_confirm_order_payment(
  p_order_id  uuid,
  p_auth_code text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.orders
     set estado = 'pagado',
         pagado_en = now(),
         transbank_authorization_code = p_auth_code
   where id = p_order_id
     and estado = 'pendiente';

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  update public.products p
     set stock = greatest(p.stock - oi.cantidad, 0)
    from public.order_items oi
   where oi.order_id = p_order_id
     and oi.product_id = p.id
     and p.stock is not null;

  return true;
end;
$$;

-- ---------------------------------------------------------------------
-- Rate limit: cuenta un intento y dice si sigue dentro del límite.
-- ---------------------------------------------------------------------
create function public.rate_limit_hit(
  p_bucket         text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits as rl (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start)
  do update set hits = rl.hits + 1
  returning rl.hits into v_hits;

  -- Limpieza oportunista de ventanas viejas (evita que la tabla crezca).
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;
