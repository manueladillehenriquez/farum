/**
 * Pruebas de la base de datos (esquema, RLS, funciones) — `npm run test:db`.
 *
 * Levanta un Postgres real en memoria (PGlite), simula los roles y helpers de
 * Supabase (anon / authenticated / service_role, auth.jwt(), auth.role(),
 * storage), aplica las migraciones REALES de este repo y comprueba qué puede
 * y qué NO puede hacer cada rol. No necesita Docker ni una cuenta de Supabase.
 *
 * Ejecútalo SIEMPRE después de tocar cualquier archivo de supabase/.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Carpeta supabase/ (este archivo vive en supabase/tests/).
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const db = new PGlite();

let pass = 0, fail = 0;
const results = [];
function record(name, ok, detail = "") {
  (ok ? pass++ : fail++);
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -> " + detail : ""}`);
}

// --- Simulación mínima de Supabase: roles, auth.jwt()/auth.role(), storage
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create function auth.role() returns text language sql stable as
    $$ select coalesce(auth.jwt() ->> 'role', 'anon') $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.jwt(), auth.role() to anon, authenticated, service_role;

  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated, service_role;
  grant all on storage.objects, storage.buckets to authenticated, service_role;
`);

import { readdirSync } from "node:fs";
const migrationFiles = readdirSync(`${ROOT}/migrations`).filter((f) => f.endsWith(".sql")).sort().map((f) => `migrations/${f}`);
for (const f of [...migrationFiles, "seed.sql"]) {
  try {
    await db.exec(readFileSync(`${ROOT}/${f}`, "utf8"));
    record(`aplica ${f}`, true);
  } catch (e) {
    record(`aplica ${f}`, false, e.message);
    console.log(results.join("\n"));
    process.exit(1);
  }
}
// Idempotencia del seed
try { await db.exec(readFileSync(`${ROOT}/seed.sql`, "utf8")); record("seed idempotente (2ª ejecución)", true); }
catch (e) { record("seed idempotente", false, e.message); }

// --- Helper: ejecutar como un rol con claims dados
async function as(role, claims, fn) {
  await db.exec(`set role ${role}`);
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify(claims ?? {})]);
  try { return await fn(); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claims','',false)`); }
}
async function expectErr(name, role, claims, sql, params, re) {
  try {
    await as(role, claims, () => db.query(sql, params));
    record(name, false, "no falló y debía fallar");
  } catch (e) {
    record(name, re.test(e.message), e.message.slice(0, 90));
  }
}
async function expectOk(name, role, claims, sql, params, check) {
  try {
    const r = await as(role, claims, () => db.query(sql, params));
    const ok = check ? check(r) : true;
    record(name, ok, ok ? "" : JSON.stringify(r.rows).slice(0, 120));
    return r;
  } catch (e) { record(name, false, e.message.slice(0, 120)); }
}

const ANON = { role: "anon" };
const USER = { role: "authenticated", sub: "11111111-1111-1111-1111-111111111111", app_metadata: {} };
const USER_FAKE_META = { role: "authenticated", sub: "22222222-2222-2222-2222-222222222222",
  app_metadata: {}, user_metadata: { role: "admin" } };
const ADMIN = { role: "authenticated", sub: "33333333-3333-3333-3333-333333333333", app_metadata: { role: "admin" } };

// --- Datos de prueba (como postgres/superusuario)
const cats = Object.fromEntries((await db.query(`select slug, id from categories`)).rows.map(r => [r.slug, r.id]));
const prod = async (nombre, catSlug, precio, estado, stock = null) =>
  (await db.query(
    `insert into products (category_id, nombre, precio, estado, stock) values ($1,$2,$3,$4,$5) returning id`,
    [cats[catSlug], nombre, precio, estado, stock])).rows[0].id;
const pA = await prod("Prod A", "oficina", 1000, "disponible", 5);
const pB = await prod("Prod B", "oficina", 2500, "disponible", null);
const pProx = (await db.query(`select id from products where nombre='Insumos de aseo'`)).rows[0].id;
const pServicio = (await db.query(`select id from products where nombre='Gasfitería'`)).rows[0].id;
const pInactivo = await prod("Prod inactivo", "oficina", 900, "disponible");
await db.query(`update products set activo=false where id=$1`, [pInactivo]);

// ============ CATÁLOGO ============
await expectOk("anon lee catálogo (solo activos)", "anon", ANON,
  `select count(*)::int n from products`,  [], r => r.rows[0].n > 0);
const anonProds = await as("anon", ANON, () => db.query(`select id from products`));
record("anon NO ve productos inactivos", !anonProds.rows.some(r => r.id === pInactivo));
await expectErr("anon NO puede insertar productos", "anon", ANON,
  `insert into products (category_id,nombre) values ($1,'Hack')`, [cats.oficina], /permission denied|row-level/i);
await expectErr("anon NO puede actualizar precios", "anon", ANON,
  `update products set precio=1`, [], /permission denied|row-level/i);
await expectErr("anon NO puede borrar categorías", "anon", ANON,
  `delete from categories`, [], /permission denied|row-level/i);

// Usuario autenticado NO admin
{
  const r = await as("authenticated", USER, () => db.query(`update products set precio=1 where id=$1`, [pA]));
  record("usuario autenticado NO-admin: update filtrado por RLS (0 filas)", r.affectedRows === 0, `filas=${r.affectedRows}`);
}
await expectErr("usuario autenticado NO-admin no inserta productos", "authenticated", USER,
  `insert into products (category_id,nombre) values ($1,'Hack')`, [cats.oficina], /row-level|permission/i);
{
  const r = await as("authenticated", USER_FAKE_META, () => db.query(`update products set precio=1 where id=$1`, [pA]));
  record("user_metadata.role='admin' NO da privilegios (solo app_metadata)", r.affectedRows === 0, `filas=${r.affectedRows}`);
}

// Admin
await expectOk("admin inserta producto", "authenticated", ADMIN,
  `insert into products (category_id,nombre,precio,estado) values ($1,'Nuevo',1234,'disponible') returning id`,
  [cats.oficina], r => r.rows.length === 1);
await expectOk("admin ve productos inactivos", "authenticated", ADMIN,
  `select id from products where id=$1`, [pInactivo], r => r.rows.length === 1);
await expectErr("trigger: 'disponible' sin precio en categoría de venta falla", "authenticated", ADMIN,
  `update products set estado='disponible' where id=$1`, [pProx], /requiere precio/i);
await expectOk("admin activa producto cargando precio (sin código)", "authenticated", ADMIN,
  `update products set precio=4990, estado='disponible' where id=$1 returning id`, [pProx], r => r.rows.length === 1);
await db.query(`update products set precio=null, estado='proximamente' where id=$1`, [pProx]); // revertir para las pruebas siguientes
await expectOk("servicio (cotizar) puede ser 'disponible' sin precio", "authenticated", ADMIN,
  `update products set estado='disponible' where id=$1 returning id`, [pServicio], r => r.rows.length === 1);

// ============ PEDIDOS: aislamiento ============
const order = async (items, extra = {}) =>
  as("service_role", { role: "service_role" }, () => db.query(
    `select * from fn_create_order($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    ["Juan Pérez", "juan@example.cl", "+56912345678", "Calle 123", "Providencia", extra.notas ?? null, JSON.stringify(items)]));

const o1 = await order([{ product_id: pA, cantidad: 2 }, { product_id: pB, cantidad: 1 }]);
const ord = o1.rows[0];
record("service_role crea pedido; total recalculado en BD (2×1000 + 1×2500 = 4500)", ord.total === 4500, `total=${ord.total}`);
record("buy_order Transbank ≤ 26 chars y con prefijo", /^FRM[A-Z0-9]{12}$/.test(ord.transbank_order_id) && ord.transbank_order_id.length <= 26, ord.transbank_order_id);

// El cliente NO puede inflar/deflactar precios: la función ignora cualquier precio enviado
const o2 = await as("service_role", { role: "service_role" }, () => db.query(
  `select * from fn_create_order('Ana Ruiz','ana@example.cl','+56987654321','Av. 1','Ñuñoa',null,$1::jsonb)`,
  [JSON.stringify([{ product_id: pA, cantidad: 1, precio: 1, total: 1 }])]));
record("precio/total enviados por el cliente son ignorados", o2.rows[0].total === 1000, `total=${o2.rows[0].total}`);

// Líneas repetidas se unen
const o3 = await order([{ product_id: pB, cantidad: 1 }, { product_id: pB, cantidad: 2 }]);
record("líneas repetidas del mismo producto se suman", o3.rows[0].total === 7500, `total=${o3.rows[0].total}`);

async function expectOrderFail(name, items, re) {
  try { await order(items); record(name, false, "no falló"); }
  catch (e) { record(name, re.test(e.message), e.message.slice(0, 80)); }
}
await expectOrderFail("rechaza producto 'próximamente'", [{ product_id: pProx, cantidad: 1 }], /PRODUCT_UNAVAILABLE/);
await expectOrderFail("rechaza servicio (categoría 'cotizar')", [{ product_id: pServicio, cantidad: 1 }], /PRODUCT_UNAVAILABLE/);
await expectOrderFail("rechaza producto inactivo", [{ product_id: pInactivo, cantidad: 1 }], /PRODUCT_UNAVAILABLE/);
await expectOrderFail("rechaza producto inexistente", [{ product_id: "99999999-9999-9999-9999-999999999999", cantidad: 1 }], /PRODUCT_UNAVAILABLE/);
await expectOrderFail("rechaza cantidad > stock", [{ product_id: pA, cantidad: 6 }], /OUT_OF_STOCK/);
await expectOrderFail("rechaza carrito vacío", [], /CART_INVALID/);
await expectOrderFail("rechaza cantidad 0", [{ product_id: pB, cantidad: 0 }], /CART_INVALID/);
await expectOrderFail("rechaza cantidad negativa", [{ product_id: pB, cantidad: -3 }], /CART_INVALID/);

// anon y authenticated NO pueden ejecutar funciones sensibles
await expectErr("anon NO puede llamar fn_create_order", "anon", ANON,
  `select * from fn_create_order('a','b','c','d','e',null,'[]'::jsonb)`, [], /permission denied/i);
await expectErr("admin autenticado NO puede llamar fn_create_order", "authenticated", ADMIN,
  `select * from fn_create_order('a','b','c','d','e',null,'[]'::jsonb)`, [], /permission denied/i);
await expectErr("anon NO puede llamar fn_confirm_order_payment", "anon", ANON,
  `select fn_confirm_order_payment($1,'x')`, [ord.order_id], /permission denied/i);
await expectErr("anon NO puede llamar rate_limit_hit", "anon", ANON,
  `select rate_limit_hit('x',1,1)`, [], /permission denied/i);

// Pedidos: anon sin acceso
await expectErr("anon NO puede leer pedidos", "anon", ANON, `select * from orders`, [], /permission denied/i);
await expectErr("anon NO puede leer order_items", "anon", ANON, `select * from order_items`, [], /permission denied/i);
await expectErr("anon NO puede insertar pedidos", "anon", ANON,
  `insert into orders (nombre_cliente,email,telefono,direccion,comuna,total,transbank_order_id) values ('a','a@b.cl','12345678','dirdir','co',1,'X')`,
  [], /permission denied/i);
await expectErr("anon NO puede leer rate_limits", "anon", ANON, `select * from rate_limits`, [], /permission denied/i);
{
  const r = await as("authenticated", USER, () => db.query(`select * from orders`));
  record("usuario autenticado NO-admin ve 0 pedidos (RLS)", r.rows.length === 0, `filas=${r.rows.length}`);
}
{
  const r = await as("authenticated", ADMIN, () => db.query(`select * from orders`));
  record("admin ve todos los pedidos", r.rows.length === 3, `filas=${r.rows.length}`);
  const it = await as("authenticated", ADMIN, () => db.query(`select * from order_items`));
  record("admin ve order_items", it.rows.length >= 4, `filas=${it.rows.length}`);
}

// Admin: solo puede cambiar `estado`, y solo pagado<->despachado
await expectErr("admin NO puede modificar el total de un pedido", "authenticated", ADMIN,
  `update orders set total=1 where id=$1`, [ord.order_id], /permission denied/i);
await expectErr("admin NO puede modificar el email de un pedido", "authenticated", ADMIN,
  `update orders set email='x@y.cl' where id=$1`, [ord.order_id], /permission denied/i);
await expectErr("admin NO puede insertar pedidos", "authenticated", ADMIN,
  `insert into orders (nombre_cliente,email,telefono,direccion,comuna,total,transbank_order_id) values ('a','a@b.cl','12345678','dirdir','co',1,'X')`,
  [], /permission denied/i);
await expectErr("admin NO puede pasar 'pendiente' a 'pagado' a mano", "authenticated", ADMIN,
  `update orders set estado='pagado' where id=$1`, [ord.order_id], /Transición de estado no permitida/i);

// ============ CONFIRMAR PAGO ============
const conf = () => as("service_role", { role: "service_role" }, () =>
  db.query(`select fn_confirm_order_payment($1,$2) ok`, [ord.order_id, "AUTH123"]));
const c1 = await conf();
record("confirmar pago 1ª vez → true", c1.rows[0].ok === true);
const c2 = await conf();
record("confirmar pago 2ª vez es idempotente → false", c2.rows[0].ok === false);
const stockA = (await db.query(`select stock from products where id=$1`, [pA])).rows[0].stock;
record("stock descontado UNA sola vez (5 - 2 = 3)", stockA === 3, `stock=${stockA}`);
const stockB = (await db.query(`select stock from products where id=$1`, [pB])).rows[0].stock;
record("stock null (sin control) se mantiene null", stockB === null);
const st = (await db.query(`select estado, authorization_code from (select estado, transbank_authorization_code authorization_code from orders where id=$1) t`, [ord.order_id])).rows[0];
record("pedido queda 'pagado' con código de autorización", st.estado === "pagado" && st.authorization_code === "AUTH123");

// Admin: pagado -> despachado permitido; luego vuelve a pagado
await expectOk("admin marca pedido pagado → despachado", "authenticated", ADMIN,
  `update orders set estado='despachado' where id=$1 returning estado`, [ord.order_id], r => r.rows[0]?.estado === "despachado");
await expectOk("admin revierte despachado → pagado", "authenticated", ADMIN,
  `update orders set estado='pagado' where id=$1 returning estado`, [ord.order_id], r => r.rows[0]?.estado === "pagado");

// ============ RATE LIMIT ============
const hits = [];
for (let i = 0; i < 5; i++) {
  const r = await as("service_role", { role: "service_role" }, () =>
    db.query(`select rate_limit_hit('login:test', 3, 60) ok`));
  hits.push(r.rows[0].ok);
}
record("rate limit: 3 permitidos y luego bloquea", JSON.stringify(hits) === "[true,true,true,false,false]", JSON.stringify(hits));

// ============ RLS activo en TODAS las tablas ============
const rls = (await db.query(`select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' order by 1`)).rows;
record("RLS activado en todas las tablas de public", rls.every(r => r.relrowsecurity), rls.map(r => `${r.relname}:${r.relrowsecurity}`).join(" "));

// ============ STORAGE ============
await expectErr("anon NO sube archivos al bucket", "anon", ANON,
  `insert into storage.objects (bucket_id,name) values ('product-images','x.png')`, [], /permission denied|row-level/i);
await expectErr("usuario no-admin NO sube archivos", "authenticated", USER,
  `insert into storage.objects (bucket_id,name) values ('product-images','x.png')`, [], /row-level/i);
await expectOk("admin sube archivo al bucket", "authenticated", ADMIN,
  `insert into storage.objects (bucket_id,name) values ('product-images','ok.png') returning id`, [], r => r.rows.length === 1);
const bk = (await db.query(`select file_size_limit, allowed_mime_types, public from storage.buckets where id='product-images'`)).rows[0];
record("bucket: límite 2MB, solo imágenes, público", bk.file_size_limit == 2097152 && bk.allowed_mime_types.length === 3 && bk.public === true);

console.log(results.join("\n"));
console.log(`\n${pass} OK · ${fail} fallos`);
process.exit(fail ? 1 : 0);
