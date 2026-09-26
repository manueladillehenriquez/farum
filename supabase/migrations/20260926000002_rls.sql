-- =====================================================================
-- FARUM · Seguridad: RLS + permisos (defensa en dos capas)
--
--   Capa 1 (GRANT/REVOKE): qué roles pueden tocar cada tabla y columna.
--   Capa 2 (RLS)         : qué filas puede ver/modificar cada rol.
--
-- Roles de Supabase:
--   anon          → visitante sin sesión (usa NEXT_PUBLIC_SUPABASE_ANON_KEY).
--   authenticated → usuario con sesión; SOLO cuenta como admin si su JWT
--                   trae app_metadata.role = 'admin' (ver public.is_admin()).
--   service_role  → solo servidor (SUPABASE_SERVICE_ROLE_KEY). Se salta RLS.
-- =====================================================================

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.rate_limits enable row level security;

-- ---------------------------------------------------------------------
-- Punto de partida: nadie tiene nada. Después se otorga lo mínimo.
-- (Supabase da privilegios amplios por defecto a anon/authenticated.)
-- ---------------------------------------------------------------------
revoke all on public.categories  from anon, authenticated;
revoke all on public.products    from anon, authenticated;
revoke all on public.orders      from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;

-- ---------------------------------------------------------------------
-- Catálogo: lectura pública; escritura solo admin.
-- ---------------------------------------------------------------------
grant select on public.categories to anon, authenticated;
grant select on public.products   to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.products   to authenticated;

create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (activo);

create policy categories_admin_all on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy products_public_read on public.products
  for select to anon, authenticated
  using (
    activo
    and exists (
      select 1 from public.categories c
       where c.id = products.category_id and c.activo
    )
  );

create policy products_admin_all on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Pedidos: anon NO tiene ninguna política ni permiso (ni lectura ni
-- escritura). Los pedidos se crean únicamente desde el servidor con
-- service_role (fn_create_order). El admin puede leerlos y solo cambiar
-- la columna `estado` (y el trigger orders_guard_estado limita cuáles
-- transiciones).
-- ---------------------------------------------------------------------
grant select on public.orders      to authenticated;
grant update (estado) on public.orders to authenticated;
grant select on public.order_items to authenticated;

create policy orders_admin_select on public.orders
  for select to authenticated
  using (public.is_admin());

create policy orders_admin_update on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy order_items_admin_select on public.order_items
  for select to authenticated
  using (public.is_admin());

-- rate_limits: RLS activo y sin políticas → solo service_role (vía función).

-- ---------------------------------------------------------------------
-- Funciones sensibles: solo service_role puede ejecutarlas.
-- (Por defecto Postgres permite EXECUTE a PUBLIC; se revoca.)
-- ---------------------------------------------------------------------
revoke all on function public.fn_create_order(text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.fn_confirm_order_payment(uuid, text)
  from public, anon, authenticated;
revoke all on function public.rate_limit_hit(text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.fn_create_order(text, text, text, text, text, text, jsonb)
  to service_role;
grant execute on function public.fn_confirm_order_payment(uuid, text)
  to service_role;
grant execute on function public.rate_limit_hit(text, integer, integer)
  to service_role;

-- is_admin() la usan las políticas RLS de anon y authenticated.
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage: bucket público de imágenes de productos.
--   - Lectura: pública (por la URL del objeto).
--   - Escritura: solo admin, máx. 2 MB, solo JPEG/PNG/WebP.
--   (El servidor además valida el contenido real del archivo.)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Supabase Storage necesita SELECT además de INSERT/UPDATE/DELETE para
-- reemplazar (upsert) y borrar objetos.
create policy product_images_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
