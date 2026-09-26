# FARUM — sitio, tienda y panel admin

Sitio de **FARUM**: ayudamos a pymes a llevar su empresa al siguiente nivel.
La oferta comercial son tres paquetes de pago único (**Inicial**, **Avanzado**
y **Full Pro**) más dos suscripciones mensuales, todos con IVA incluido; los
montos viven en [`lib/site-config.ts`](lib/site-config.ts).

Además, el sitio tiene una **tienda**: catálogo de productos y servicios,
carrito, checkout como invitado con **Webpay Plus (Transbank)** y un **panel
admin con CRM básico** para gestionar pedidos, productos y categorías.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
Supabase (Postgres + Auth + Storage) · Webpay Plus · Cloudflare Turnstile ·
desplegado en **Vercel** → `https://www.farum.cl`.

> ⚠️ **Antes de publicar lee la sección [Pasos manuales](#pasos-manuales-lo-que-debes-hacer-tú).**
> El sitio ya no es estático: necesita Supabase y variables de entorno en
> Vercel, y el DNS debe apuntar a Vercel (hoy apunta a GitHub Pages).

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Correrlo en local](#correrlo-en-local)
3. [Pasos manuales (lo que debes hacer tú)](#pasos-manuales-lo-que-debes-hacer-tú)
4. [Operación diaria](#operación-diaria)
5. [Seguridad](#seguridad)
6. [Monitoreo](#monitoreo)
7. [Costos y planes](#costos-y-planes)
8. [Pendientes / fuera de alcance](#pendientes--fuera-de-alcance)
9. [Estructura del proyecto](#estructura-del-proyecto)
10. [Marca y logos](#marca-y-logos)
11. [Notas técnicas](#notas-técnicas)

---

## Arquitectura

```
                    Navegador del cliente
                            │  (nunca habla directo con Supabase)
                            ▼
   ┌──────────────── Next.js en Vercel ────────────────┐
   │  Páginas (server components)   /catalogo  /carrito │
   │  API routes                    /api/checkout       │
   │                                /api/webpay/retorno │
   │  Panel admin (server actions)  /admin/**           │
   │  middleware.ts                 protege /admin      │
   └───────┬─────────────────┬──────────────┬───────────┘
           │ anon key (RLS)  │ service_role │ Transbank SDK
           ▼                 ▼   (solo      ▼
   Lectura pública    pedidos y   servidor)  Webpay Plus
   del catálogo       rate limit
           └──────── Supabase (Postgres + RLS + Auth + Storage) ────────┘
```

**Flujo de una compra**

1. El cliente arma su carrito (se guarda en `localStorage`; **solo IDs y
   cantidades importan**, los precios guardados son para mostrar).
2. En `/checkout` completa sus datos (invitado, sin cuenta) y pasa Turnstile.
3. `POST /api/checkout` valida todo con Zod y llama a la función SQL
   `fn_create_order`, que **lee los precios reales de la base y calcula el
   total dentro de la misma transacción**. Ese total es el que se manda a
   Webpay: nada que venga del navegador puede cambiar el monto.
4. El cliente paga en Webpay. Transbank lo devuelve a
   `/api/webpay/retorno`, donde el **servidor** hace el `commit`, verifica que
   la orden de compra y el monto coincidan con el pedido y recién ahí lo marca
   `pagado` (y descuenta stock) con `fn_confirm_order_payment`, que es
   idempotente.
5. `/pedido/<token>` muestra el resultado (el token es un UUID aleatorio, no el
   número correlativo, y el correo se muestra enmascarado).

**Modelo de datos** (`supabase/migrations/`): `categories`, `products`,
`orders`, `order_items`, `rate_limits`. El admin es un usuario de **Supabase
Auth** con `app_metadata.role = "admin"` (no hay tabla de contraseñas propia).

**Categorías tipo "cotizar"** (Servicios): no tienen carrito ni precio; el
botón **Cotizar** abre WhatsApp con un mensaje precargado (`serviceQuoteMessage`
en `lib/site-config.ts`). Las demás categorías son de **venta**.

**Activar un producto no requiere código:** en `/admin/productos` cargas el
precio y cambias el estado de "Próximamente" a "Disponible". La regla vive
también en la base de datos (un producto de venta no puede quedar
"disponible" sin precio).

---

## Correrlo en local

Necesitas Node.js LTS (24 recomendado).

```bash
npm install
cp .env.example .env.local     # y completa los valores (ver más abajo)
npm run dev
```

Abre `http://localhost:3000`. Sin variables de Supabase el sitio de marketing
funciona igual y `/catalogo` muestra un aviso ("catálogo no disponible") en
vez de romperse.

`.env.example` ya trae las **claves de prueba oficiales de Turnstile** (siempre
aprueban) y `TRANSBANK_ENV=integration` (sandbox: **no se cobra dinero real**).
Para probar la tienda completa en local necesitas un proyecto de Supabase
(paso 1 de abajo; se recomienda uno separado del de producción).

Otros comandos: `npm run build` · `npx tsc --noEmit` · `npm run lint` ·
`npm run test:db` (aplica las migraciones a un Postgres en memoria y comprueba
RLS, permisos y las funciones de pedidos; córrelo siempre que toques
`supabase/`).

---

## Pasos manuales (lo que debes hacer tú)

Sigue este orden. Los pasos 1 a 4 se pueden hacer **antes** de tocar el DNS:
mientras tanto `www.farum.cl` sigue mostrando el sitio actual de GitHub Pages.

### 1. Crear el proyecto de Supabase

1. Entra a <https://supabase.com> → **New project**.
   - **Region:** `South America (São Paulo)` (la más cercana a Chile).
   - Guarda la contraseña de la base de datos en tu gestor de contraseñas.
2. **Aplica el esquema.** En el proyecto: **SQL Editor** → *New query*; pega y
   ejecuta, **en este orden**, el contenido de:
   1. [`supabase/migrations/20260926000001_schema.sql`](supabase/migrations/20260926000001_schema.sql)
   2. [`supabase/migrations/20260926000002_rls.sql`](supabase/migrations/20260926000002_rls.sql)
   3. [`supabase/seed.sql`](supabase/seed.sql) (categorías y marcadores
      "Próximamente"; se puede ejecutar más de una vez sin duplicar).
3. **Copia las claves:** *Project Settings → API*.
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pública, la protege RLS)
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**secreta**: se salta RLS;
     solo va en Vercel, nunca en el código ni con prefijo `NEXT_PUBLIC_`)
4. **Cierra los registros públicos:** *Authentication → Sign In / Providers*
   → desactiva **"Allow new users to sign up"**. Así nadie puede crearse una
   cuenta; el único usuario es el admin que crearás tú.
5. Verifica **RLS**: *Table Editor* → cada tabla debe mostrar el candado de
   RLS activo (las migraciones ya lo activan).

### 2. Crear tu cuenta de admin (no está en el código)

1. *Authentication → Users → Add user → Create new user*: tu correo y una
   contraseña larga y única. Marca **Auto Confirm User**.
2. Dale el rol de admin. En *SQL Editor* ejecuta (con **tu** correo):

   ```sql
   update auth.users
      set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
    where email = 'TU-CORREO@dominio.cl';
   ```

   El rol va en `app_metadata`, que **solo** se puede modificar desde el
   dashboard/SQL o con la clave service_role: un usuario no puede
   asignárselo desde el navegador (a diferencia de `user_metadata`).
3. Entra a `/admin/login`. Si acabas de asignar el rol, cierra sesión y vuelve
   a entrar para que el token lo incluya.

> Recomendado: activa MFA/2FA en tu cuenta de Supabase (dashboard) y usa una
> contraseña que no reutilices.

### 3. Crear el widget de Cloudflare Turnstile (anti-bots)

1. Cloudflare → **Turnstile** → *Add widget*.
2. **Hostnames:** `www.farum.cl` y `farum.cl` (agrega `localhost` si quieres
   probar con claves reales en local). Modo: *Managed*.
3. Copia la **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y el **Secret Key**
   → `TURNSTILE_SECRET_KEY`.

### 4. Conectar el repo a Vercel

1. <https://vercel.com> → **Add New → Project** → importa
   `manueladillehenriquez/farum`. El framework (Next.js) se detecta solo.
2. **Environment Variables** (Settings → Environment Variables). Crea estas
   para **Production**:

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://www.farum.cl` |
   | `NEXT_PUBLIC_SUPABASE_URL` | del paso 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | del paso 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | del paso 1 — marcar como **Sensitive** |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | del paso 3 |
   | `TURNSTILE_SECRET_KEY` | del paso 3 — marcar como **Sensitive** |
   | `TRANSBANK_ENV` | `integration` (sandbox) hasta tener credenciales reales |

   Para **Preview** usa valores de prueba (claves de prueba de Turnstile,
   `TRANSBANK_ENV=integration` y, idealmente, un proyecto de Supabase aparte).
3. **Deploy.** Vercel te da una URL `*.vercel.app` para probar todo **antes**
   de tocar el DNS (`/catalogo`, `/admin/login`, una compra de prueba).
4. **Agregar el dominio:** *Settings → Domains* → agrega `www.farum.cl`.
   Vercel te mostrará el valor exacto del **CNAME** que debes usar (suele ser
   `cname.vercel-dns.com` o un valor propio del proyecto — usa el que Vercel
   indique).

> **`git push` a `main` ya no publica en GitHub Pages:** el workflow
> `deploy.yml` se eliminó. Desde ahora cada push a `main` despliega en Vercel
> y cada Pull Request genera una URL de preview. El único workflow que queda
> es `ci.yml`, que solo verifica (tipos, lint, build) y no publica nada.

### 5. Cambiar el DNS en Cloudflare (aquí ocurre el corte)

En Cloudflare → `farum.cl` → **DNS → Records**:

1. Edita el registro **CNAME `www`**:
   - **Content:** el valor que te indicó Vercel (antes:
     `manueladillehenriquez.github.io`).
   - **Proxy status: _DNS only_ (nube gris)**. Vercel gestiona su propio
     certificado y, con la nube naranja, todas las visitas llegan con la IP de
     Cloudflare y el rate limiting por IP pierde precisión.
2. **No toques** estos registros, que ya existen y siguen siendo necesarios:
   - **`A farum.cl → 192.0.2.1` (proxied)** + la regla
     *Rules → Redirect Rules → "Redirect from root to WWW"*: hacen que
     `farum.cl` (sin www) redirija con 301 a `https://www.farum.cl`. La IP
     `192.0.2.1` es un marcador: nunca recibe tráfico porque la redirección
     ocurre en el borde de Cloudflare.
   - **`TXT farum.cl → google-site-verification=…`**: es la verificación de
     Google Search Console. Si lo borras, Google revoca la propiedad.
3. Espera a que Vercel marque el dominio como **Valid Configuration** y emita
   el certificado (minutos).
4. Prueba `https://www.farum.cl`, `http://farum.cl` y `https://farum.cl`.
5. **Desactiva GitHub Pages** para que no quede un sitio viejo publicado:
   repo → *Settings → Pages → Build and deployment → Source: None* (y borra el
   "Custom domain" si sigue ahí).

Si algo sale mal, el **rollback** es volver a poner el CNAME `www` en
`manueladillehenriquez.github.io` (mientras GitHub Pages siga habilitado).

### 6. Search Console

Tras el cambio, en Google Search Console (propiedad de dominio `farum.cl`):
*Sitemaps* → reenvía `https://www.farum.cl/sitemap.xml` (ahora incluye
`/catalogo` y las categorías) y solicita la indexación de la portada y de
`/catalogo`.

### 7. Pasar Webpay a producción (cuando corresponda)

Hasta entonces el checkout funciona en **sandbox** (muestra un aviso
"Modo de pruebas" y no cobra dinero real). Para cobrar de verdad:

1. Contrata Webpay Plus con Transbank y completa su **proceso de validación**
   de la integración (guía y credenciales de prueba en
   <https://www.transbankdevelopers.cl/>).
2. Transbank te entrega el **Código de Comercio** y la **API Key (secreto)**.
3. En Vercel, variables de **Production**:
   - `TRANSBANK_ENV` = `production`
   - `TRANSBANK_COMMERCE_CODE` = tu código de comercio
   - `TRANSBANK_API_KEY` = tu API key (marcar **Sensitive**)
4. **Redeploy** (las variables se aplican al siguiente despliegue).
5. Haz **una compra real de monto bajo** y revisa que el pedido pase a
   `pagado` en `/admin`. Puedes anularla desde el portal de Transbank.

Para probar el pago exitoso en sandbox usa las **tarjetas de prueba oficiales**
de Transbank (están en su documentación, sección *Ambientes → Ambiente de
integración*). El sandbox nunca mueve dinero.

---

## Operación diaria

- **Ver y despachar pedidos:** `/admin` → filtra por estado y fecha o busca por
  nombre, correo o N.º de pedido → entra al detalle → **Marcar como
  despachado**. El panel solo permite pasar entre `pagado` ⇄ `despachado`; el
  estado de pago lo decide únicamente Webpay.
- **Pedidos `pendiente`:** significa que aún no hay confirmación de Webpay. Si
  pasa más de una hora y el cliente dice que le cobraron, revisa la
  transacción en el portal de Transbank con la *orden de compra* que ves en
  el detalle del pedido.
- **Clientes (CRM):** `/admin/clientes` agrupa compradores por correo (total
  comprado, N.º de pedidos, última compra), con filtro por fecha y estado.
- **Cargar o activar un producto:** `/admin/productos` → *Nuevo producto* (o
  *Editar*). Para activarlo: precio + estado **Disponible**. Stock vacío =
  sin control de stock. Imagen: JPG/PNG/WebP hasta 2 MB.
- **Categorías:** `/admin/categorias`. Tipo *Venta* (carrito) o *Cotizar*
  (WhatsApp). El catálogo público se actualiza en menos de 1 minuto.
- **Cambiar precios de los paquetes o textos del sitio:** `lib/site-config.ts`.

---

## Seguridad

Cada punto de la lista de seguridad y dónde está implementado:

| Medida | Cómo se cumple | Dónde |
|---|---|---|
| Ocultar claves API | Todas en variables de entorno de Vercel; `.env*` en `.gitignore` (solo `.env.example`, sin valores reales) | `.gitignore`, `.env.example` |
| Secretos en git | Se revisaron los 13 commits del historial: **ningún secreto** (sin `.env`, llaves ni credenciales) → no hay nada que rotar | — |
| Clave pública en el cliente | Solo `NEXT_PUBLIC_*` viaja al navegador. `SUPABASE_SERVICE_ROLE_KEY` vive en `lib/server/env.ts` (`import "server-only"`): si un componente cliente lo importa, **el build falla**. Además el navegador nunca habla con Supabase | `lib/env.ts`, `lib/server/env.ts` |
| RLS en todas las tablas | Activada en las 5 tablas y en Storage desde la primera migración | `supabase/migrations/…_rls.sql` |
| Autenticación de servidor | `middleware.ts` + `requireAdmin()` en **cada** página y **cada** Server Action del panel; los checks de cliente nunca cuentan | `middleware.ts`, `lib/auth/require-admin.ts` |
| Restringir acceso a registros | `anon` no tiene ni un permiso sobre `orders`/`order_items`/`rate_limits`; el admin solo puede leer pedidos y cambiar la columna `estado` (`pagado ⇄ despachado`); las funciones sensibles solo las ejecuta `service_role` | migración RLS + trigger `orders_guard_estado` |
| Bloquear manipulación de campos | El monto se calcula **dentro de la base** desde los precios reales (`fn_create_order`); el navegador solo manda producto + cantidad. Se verificó falsificando precios a $1: se cobró el precio real | `…_schema.sql`, `app/api/checkout/route.ts` |
| Cookies de sesión | `httpOnly`, `Secure` (en producción) y `SameSite=Lax` | `lib/supabase/cookie-options.ts` |
| Hash de contraseñas | Delegado a Supabase Auth (bcrypt); no hay manejo propio de contraseñas | — |
| Límite de intentos de login | 10 por IP y 5 por correo cada 15 min, en Postgres (falla cerrado) | `lib/security/rate-limit.ts`, `app/admin/(auth)/login/actions.ts` |
| Protección contra bots | **Cloudflare Turnstile** en checkout y login (verificado en el servidor, falla cerrado) | `lib/security/turnstile.ts` |
| Monitorizar consultas de DB | Ver [Monitoreo](#monitoreo) | — |
| Validar todas las entradas | **Zod** en checkout, carrito, login y todas las acciones admin (mismos esquemas en cliente y servidor) | `lib/validation/*` |
| Escapar contenido de usuario | React escapa por defecto (no se usa `dangerouslySetInnerHTML` con datos de usuarios) + se eliminan `<`, `>` y caracteres de control al entrar | `lib/security/sanitize.ts` |
| Restringir subida de archivos | Solo JPG/PNG/WebP, máx. 2 MB, validando los **bytes reales** del archivo (no extensión ni `Content-Type`); nombre aleatorio; SVG/HTML/PHP/EXE rechazados; el bucket también limita tamaño y tipo; solo el admin puede escribir | `lib/security/image-upload.ts`, `app/admin/actions.ts` |
| Limitar respuestas de API | Rate limit en `/api/checkout` (10/10 min), `/api/cart/refresh` (60/min) y el retorno de Webpay (60/min); cuerpos acotados (32 KB) y verificación de `Origin` (CSRF) | `lib/security/*` |
| Cabeceras de seguridad | CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS | `next.config.ts` |
| Forzar HTTPS | Vercel lo fuerza + cabecera HSTS (2 años, `includeSubDomains`, **sin** `preload` a propósito) | `next.config.ts` |
| Escanear dependencias | **Dependabot** (semanal) + `npm audit` informativo en el CI | `.github/dependabot.yml`, `.github/workflows/ci.yml` |

### Cifrado de datos sensibles (pgcrypto): evaluado, **no aplicado**

Se evaluó cifrar `telefono` y `direccion` con `pgcrypto` y se decidió **no
hacerlo por ahora**:

- Ya se **minimizó** el dato: no hay cuentas de cliente, contraseñas ni datos
  de tarjeta; solo los datos mínimos de despacho.
- Supabase cifra los datos **en reposo** (AES-256) y **en tránsito** (TLS), y
  RLS impide que cualquiera salvo el admin los lea.
- El cifrado a nivel de columna obliga a guardar una clave en algún lugar que la
  aplicación pueda usar; si esa clave está junto a los datos (o en la misma
  aplicación comprometida), no aporta protección extra real, y complica
  búsquedas, respaldos y rotación de claves.
- Si más adelante se justifica (por ejemplo, exigencia de un cliente o de la
  Ley 21.719), la opción recomendada es **Supabase Vault** con la clave fuera
  de la base, y hacerlo como una migración.

### Compromisos de la CSP (para que no sorprenda)

`script-src` incluye `'unsafe-inline'` porque Next.js inyecta scripts para la
hidratación y el fondo animado del hero es un `<iframe srcDoc>` con scripts
inline y CDNs (Tailwind, GSAP, iconify). Una CSP con *nonce* obligaría a que
**todas** las páginas se rendericen de forma dinámica. Lo compensan: React
escapa el contenido, se sanitiza la entrada y no hay HTML de usuarios. Si un
día se reemplaza el hero por algo sin CDNs, conviene pasar a nonces.

### Vulnerabilidades conocidas hoy

`npm audit` reporta avisos en el **PostCSS que trae Next.js empaquetado**. Solo
se ejecuta en tiempo de *build* sobre nuestro propio CSS (no procesa entrada
de usuarios) y el único arreglo que ofrece npm es saltar a Next 16 (cambio
mayor). Dependabot avisará cuando exista una corrección compatible.

---

## Monitoreo

- **Supabase → Logs**: *Postgres Logs* (errores de consultas), *API Edge Logs*
  (peticiones), *Auth Logs* (intentos de login). Filtra por `severity = ERROR`
  y busca picos de `401/403` o de logins fallidos. Revísalo al menos una vez
  por semana y tras cualquier campaña.
- **Supabase → Reports → Database**: consultas lentas y uso.
- **Vercel → Logs**: el código registra mensajes con prefijo `[checkout]` y
  `[webpay]` cuando algo inesperado ocurre (no incluyen datos personales).
  Ojo especial a `[webpay] la respuesta no coincide con el pedido` (el sistema
  ya intentó revertir el cobro; revisa el pedido a mano).
- **Consultas útiles** (SQL Editor):

  ```sql
  -- Pedidos pendientes hace más de 1 hora (posibles pagos sin confirmar)
  select numero, creado_en, total, transbank_order_id
    from orders where estado = 'pendiente' and creado_en < now() - interval '1 hour';

  -- Actividad anómala: pedidos creados por hora (últimas 24 h)
  select date_trunc('hour', creado_en) h, count(*) from orders
   where creado_en > now() - interval '24 hours' group by 1 order by 1 desc;

  -- Quién está siendo bloqueado por el rate limit (hits > límite)
  select bucket, window_start, hits from rate_limits
   where window_start > now() - interval '1 day' order by hits desc limit 20;
  ```

---

## Costos y planes

- **Vercel Hobby no permite uso comercial.** Como el sitio vende productos y
  servicios, hay que usar **Vercel Pro** (US$20/mes por usuario) desde el
  primer día en producción.
- **Supabase Free pausa el proyecto tras 1 semana sin actividad** y no tiene
  respaldos diarios. Para una tienda real usa **Supabase Pro** (US$25/mes).
- Cloudflare (DNS y Turnstile), GitHub y Dependabot: gratis.

(Precios de referencia; confírmalos en cada proveedor.)

---

## Pendientes / fuera de alcance

- **Emails transaccionales:** no hay proveedor de correo elegido. El punto de
  enlace está listo en [`lib/server/notifications.ts`](lib/server/notifications.ts)
  (`notifyOrderPaid`), que ya se invoca al confirmar un pago. Hoy el cliente
  ve su confirmación en `/pedido/<token>` y tú los pedidos en `/admin`.
- **Facturación electrónica SII:** pendiente; no bloquea nada. Se puede
  colgar de `notifyOrderPaid` o de un paso manual desde `/admin`.
- **Costo de despacho:** hoy el total es la suma de los productos (IVA
  incluido) y el despacho se coordina por WhatsApp. Agregarlo es un campo
  nuevo en `orders` y una línea en `fn_create_order`.
- **Productos reales de aseo, infraestructura y oficina:** el catálogo tiene la
  estructura y marcadores "Próximamente"; se cargan desde `/admin`.
- **Cuentas de cliente:** fuera de alcance a propósito (checkout siempre como
  invitado).
- **Conciliación de pedidos `pendiente`:** hoy es revisión manual (ver
  [Operación diaria](#operación-diaria)).
- **Actualizar Next.js 16** cuando corrija los avisos de PostCSS.

---

## Estructura del proyecto

```
├── app/
│   ├── layout.tsx              Metadata SEO, JSON-LD, fuentes, CartProvider
│   ├── page.tsx                Portada (secciones de marketing)
│   ├── (tienda)/               Catálogo, carrito, checkout, pedido
│   │   ├── catalogo/  carrito/  checkout/  pedido/[token]/
│   ├── admin/                  Panel (login en (auth), resto en (panel))
│   ├── api/
│   │   ├── checkout/route.ts   Crea pedido + transacción Webpay
│   │   ├── webpay/retorno/     Commit y confirmación del pago
│   │   └── cart/refresh/       Precios/stock actuales del carrito
│   ├── sitemap.ts  robots.ts
├── components/
│   ├── ui/ sections/           Portada (hero, servicios, FAQ, contacto…)
│   ├── store/                  Tarjetas de producto, carrito, checkout
│   ├── cart/                   CartProvider (localStorage validado con Zod)
│   ├── admin/                  Formularios y tablas del panel
│   └── security/               Widget de Turnstile
├── lib/
│   ├── site-config.ts          ⭐ Contenido y datos del negocio (incl. textos de la tienda)
│   ├── env.ts                  Variables públicas
│   ├── server/                 Solo servidor: env secretas, Webpay, pedidos
│   ├── supabase/               Clientes: público (anon), sesión (admin), service_role
│   ├── security/               Rate limit, Turnstile, sanitización, imágenes, CSRF
│   ├── validation/             Esquemas Zod
│   └── auth/                   requireAdmin()
├── supabase/
│   ├── migrations/             Esquema + RLS (aplicar en orden)
│   └── seed.sql                Categorías y marcadores
├── middleware.ts               Protege /admin
├── next.config.ts              Cabeceras de seguridad, imágenes
└── public/brand/               Logos FARUM
```

---

## Marca y logos

Los logos están en [`public/brand/`](public/brand), en dos formatos y dos colores:

| Archivo | Uso |
|---|---|
| `farum-logo-horizontal-white.png` | Header (fondo oscuro) |
| `farum-logo-vertical-white.png` | Footer (fondo oscuro) |
| `farum-icon-white.png` | Solo el faro, blanco |
| `farum-logo-*-black.png`, `farum-icon-black.png` | Versiones negras, para fondos claros (impresos, documentos) |

Son PNG con fondo transparente. Si más adelante tienes los logos en vectorial
(SVG), conviene reemplazarlos: se verán nítidos a cualquier tamaño.

---

## Notas técnicas

- **Fondo del hero (`GatewayFlow`)**: es un `<iframe>` que carga scripts desde
  CDNs (Tailwind, GSAP, iconify), así que necesita conexión a internet para
  mostrarse. Es decorativo (`aria-hidden`) y se congela si el usuario tiene
  activada la opción de reducir animaciones. Como un `srcDoc` hereda la CSP de
  la página, esos hosts están permitidos en `next.config.ts`.
- **Agenda**: el bloqueo de horarios usa `localStorage`, es decir, es por
  navegador y no hay backend compartido. Sirve porque cada reserva llega por
  WhatsApp y se confirma a mano.
- **Repo y URL**: el repositorio es `manueladillehenriquez/farum`, desplegado en
  Vercel y servido en `https://www.farum.cl/`. Si cambias de dominio hay que
  actualizar `NEXT_PUBLIC_SITE_URL` en Vercel, el dominio en Vercel, el DNS, el
  widget de Turnstile y `SITE_URL` en `lib/env.ts` (valor por defecto).
- **Descuento de stock:** ocurre al **confirmar el pago**, no al crear el
  pedido. Si dos clientes compran la última unidad a la vez, ambos pagan y el
  stock queda en 0 (nunca negativo); el segundo pedido hay que resolverlo a
  mano. Es un compromiso aceptable para este volumen.
