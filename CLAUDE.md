# CLAUDE.md

Guía para trabajar en este proyecto: el sitio de **FARUM** (Next.js 15,
App Router, TypeScript, Tailwind v4), publicado en `https://www.farum.cl/`.

Ya **no es un sitio estático**: es una app Next.js completa desplegada en
**Vercel**, con **Supabase** (Postgres + Auth + Storage) como backend, pagos con
**Webpay Plus (Transbank)** y un **panel admin** en `/admin`. El README tiene
la arquitectura, el paso a paso de configuración y la tabla de seguridad; este
archivo es la guía rápida de convenciones y de lo que no es obvio.

## Regla #1: el contenido de marketing vive en `lib/site-config.ts`

Precios de los paquetes, textos del hero, los pilares de "El siguiente nivel",
los sellos de "¿Por qué elegirnos?", FAQ, datos de contacto, horarios,
mensajes de WhatsApp, la navegación (`nav`) y **todo el texto de la interfaz de
la tienda** (`catalog`, `cart`, `checkout`, `order`) están centralizados ahí.
Los componentes solo lo leen — **no** escribas copy a mano dentro de un
componente si ya existe (o debería existir) un campo en `site-config.ts` para
eso. Si agregas contenido nuevo, agrégalo primero a la config y luego
consúmelo desde el componente. (El panel `/admin` es interno y puede llevar
sus textos en los componentes.)

**Excepción, y es importante:** los **productos, categorías y precios de la
tienda NO están en `site-config.ts`: viven en Supabase** y se editan desde
`/admin`. No los copies al código.

## Oferta y precios de los paquetes (leerlos siempre de acá, no de memoria)

La oferta comercial son **3 paquetes de pago único + 2 suscripciones
mensuales**, todos con **IVA incluido**. Los montos y qué incluye cada uno
están en `siteConfig.pricing` (`lib/site-config.ts`), como constantes
(`INITIAL_PRICE`, `ADVANCED_PRICE`, `FULL_PRO_PRICE`, `APP_PRICE`,
`MONTHLY_PRICE`, `MONTHLY_APP_PRICE`) arriba del archivo. La oferta ha
cambiado varias veces (nombres de planes, qué incluye cada uno, qué es "de
regalo" vs. "servicio aparte", y los precios mismos) — **no copies un precio de
un chat, un README viejo o una sesión anterior**: léelo del archivo en el
momento. Los paquetes se cotizan por WhatsApp; **no** pasan por el carrito.

## Dominio, DNS y publicación

- Dominio propio `www.farum.cl`, **DNS en Cloudflare**. Se despliega en
  **Vercel** (repo `manueladillehenriquez/farum`): cada `git push` a `main`
  despliega en producción y cada PR genera un preview. **Ya no se usa GitHub
  Pages** (se eliminaron `deploy.yml` y los `CNAME`). El único workflow es
  `.github/workflows/ci.yml` (tipos, lint, build; no publica).
- Registros de Cloudflare que existen y **no deben borrarse** sin entender qué
  rompen:
  - `CNAME www` → destino de Vercel, en **DNS only (nube gris)**.
  - `A farum.cl → 192.0.2.1` (proxied) + regla *Redirect from root to WWW*
    (Rules → Redirect Rules): `farum.cl` → `https://www.farum.cl` con 301. La
    IP es un marcador que nunca recibe tráfico.
  - `TXT farum.cl → google-site-verification=…`: verifica la propiedad de
    dominio `farum.cl` en Google Search Console. Sin él, se pierde la
    verificación.
- **La migración de GitHub Pages a Vercel depende de pasos manuales del dueño**
  (crear proyecto Supabase, variables en Vercel, cambiar el CNAME): están en el
  README, sección "Pasos manuales". Mientras el CNAME no cambie, `www.farum.cl`
  sigue sirviendo la última build de GitHub Pages.
- Si el dominio cambia otra vez, hay que actualizar: `NEXT_PUBLIC_SITE_URL` en
  Vercel (y su valor por defecto en `lib/env.ts`), el dominio en Vercel, el DNS
  en Cloudflare, los hostnames del widget de Turnstile, y reenviar el sitemap
  en Search Console.

## Estructura

```
app/
  layout.tsx        Metadata SEO, JSON-LD, fuentes (next/font), CartProvider
  page.tsx           Portada: ensambla las secciones de marketing
  (tienda)/          Catálogo, carrito, checkout, confirmación de pedido
  admin/             Panel: login en (auth)/, el resto en (panel)/
  api/checkout       Crea el pedido (monto calculado en la BD) + transacción Webpay
  api/webpay/retorno Commit y confirmación del pago (lo hace el SERVIDOR)
  api/cart/refresh   Precios/stock actuales para el carrito
  globals.css        Tema oscuro + paleta azul de marca (ver abajo)
  icon.png / apple-icon.png   Favicon (el faro, sobre fondo oscuro)
  sitemap.ts / robots.ts      (incluyen las categorías del catálogo)
components/
  ui/  sections/     Portada (hero, GatewayFlow, servicios, FAQ, contacto…)
  store/  cart/      Tarjetas de producto, carrito, checkout; CartProvider
  admin/  security/  Formularios del panel; widget de Turnstile
  site-footer.tsx  site-signature.tsx  whatsapp-fab.tsx
lib/
  site-config.ts   ⭐ Contenido de marketing y textos de la tienda
  env.ts           Variables PÚBLICAS (NEXT_PUBLIC_*)
  server/          SOLO servidor (`import "server-only"`): env secretas, Webpay, pedidos
  supabase/        public.ts (anon) · session.ts (admin) · service.ts (service_role)
  security/        rate-limit, turnstile, sanitize, image-upload, origin (CSRF)
  validation/      Esquemas Zod (checkout, admin)
  auth/            requireAdmin()
supabase/
  migrations/      Esquema + RLS (se aplican EN ORDEN en Supabase)
  seed.sql         Categorías y marcadores "Próximamente"
middleware.ts      Protege /admin
next.config.ts     Cabeceras de seguridad (CSP, HSTS…), imágenes
public/brand/      Logos FARUM: horizontal/vertical × blanco/negro, más el ícono solo
public/clients/    Logos de clientes (sin uso: la sección se retiró)
```

## Reglas de seguridad al tocar la tienda (no negociables)

- **El monto lo calcula la base de datos, nunca el navegador.** El carrito
  solo aporta `product_id` + `cantidad`. El precio, el nombre y el total salen
  de `fn_create_order` (SQL) dentro de la misma transacción. No agregues campos
  de precio/total a lo que manda el cliente.
- **Un pedido solo pasa a `pagado` por el `commit` del servidor** en
  `/api/webpay/retorno`, verificando orden de compra y monto. Un estado
  `fallido` solo se fija con un resultado DEFINITIVO de Transbank (un
  `INITIALIZED` deja el pedido `pendiente`, para no marcar como fallido algo que
  después se paga).
- **Todas las tablas tienen RLS.** Cualquier tabla nueva debe crearse con RLS
  activo y `revoke all … from anon, authenticated` antes de otorgar lo mínimo.
  `anon` no debe tener acceso a `orders`/`order_items`/`rate_limits`.
- **`SUPABASE_SERVICE_ROLE_KEY` solo en código de servidor.** Vive en
  `lib/server/env.ts` (`server-only`); nunca la importes desde un componente
  cliente ni le pongas prefijo `NEXT_PUBLIC_`. El panel admin **no** usa
  service_role: opera con la sesión del admin y queda sujeto a RLS.
- **El admin es un usuario de Supabase Auth con `app_metadata.role = "admin"`.**
  `requireAdmin()` se llama al inicio de **cada** página y **cada** Server
  Action del panel; el middleware es solo la primera barrera.
- **Toda entrada se valida con Zod en el servidor** (los esquemas se comparten
  con el formulario, pero el que cuenta es el del servidor) y el texto libre
  pasa por `lib/security/sanitize.ts`. Imágenes: solo por
  `lib/security/image-upload.ts` (firma real del archivo).
- **El `localStorage` del carrito es entrada no confiable**: se valida con Zod
  al leerlo (`lib/cart.ts`) y `/api/cart/refresh` lo sincroniza con precios
  reales. En `CartProvider` las acciones leen de `linesRef`, no del estado, para
  que dos cambios seguidos no se pisen.
- **Cambios de esquema = migración nueva** en `supabase/migrations/` (no edites
  las ya aplicadas en producción) y **se aplica en Supabase ANTES de desplegar
  el código** que depende de ella. **Corre `npm run test:db` después de tocar
  cualquier archivo de `supabase/`**: aplica las migraciones reales a un
  Postgres en memoria (PGlite, simulando los roles de Supabase) y comprueba qué
  puede y qué NO puede hacer cada rol. Si agregas una regla de acceso nueva,
  agrega su prueba en `supabase/tests/rls.test.mjs`.
- Los endpoints públicos (`/api/*`) verifican `Origin`, acotan el tamaño del
  cuerpo y llevan rate limit (`lib/security/rate-limit.ts`, falla cerrado).

## Cosas no obvias que vale la pena saber antes de tocar código

- **Color de marca vs. WhatsApp**: el acento del sitio (`--color-accent`,
  usado en eyebrows, íconos, bordes activos, sellos, etc.) es **azul**
  (`--brand` en `globals.css`), no verde. El verde (`--whatsapp`) está
  reservado exclusivamente para lo relacionado con WhatsApp — el botón
  flotante, "Abrir WhatsApp", "Cotizar por WhatsApp", el botón "Cotizar" de los
  servicios, etc. usan `bg-[var(--whatsapp)]` explícito, no la clase de acento
  genérica. Si agregas un botón o ícono nuevo, piensa cuál de los dos le
  corresponde.
- **`site-signature.tsx`** es una firma de **texto** ("By Farum"), no una
  imagen de logo — una cinta oscura semitransparente fija en la esquina
  inferior derecha, debajo del botón de WhatsApp para no pisarlo.
- **`GatewayFlow` (fondo animado del hero)** es un `<iframe srcDoc>` que carga
  Tailwind, GSAP e iconify desde CDNs — necesita internet para verse, y es
  pesado para lo que hace. Es decorativo (`aria-hidden`) y se congela con
  `prefers-reduced-motion`. **Un `srcDoc` hereda la CSP de la página**: por eso
  `next.config.ts` permite esos hosts (`cdn.tailwindcss.com`,
  `cdnjs.cloudflare.com`, `code.iconify.design`, fuentes de Google, imágenes de
  `cdn.21st.dev`). Si cambias los recursos del iframe, actualiza la CSP o se
  romperá en producción (en desarrollo no se nota porque `unsafe-eval` está
  permitido). Si el sitio se siente lento, este es el primer sospechoso.
- **`RotatingWord`** anima una palabra dentro del `<h1>` del hero (hoy:
  empresa / negocio / pyme), en la fuente Space Grotesk (`--font-space-
  grotesk`), distinta de la serif del titular. El `<h1>` real lleva la
  frase completa en un `sr-only` para buscadores y lectores de pantalla —
  la versión animada es puramente visual (`aria-hidden`). Si cambias el
  titular, edita `siteConfig.hero.title` / `rotatingWords` / `titleLine2`,
  no el JSX.
- **Agenda (`booking-section.tsx`)**: el bloqueo de horarios usa
  `localStorage`, es decir, es por navegador — no hay backend compartido.
  Cada reserva llega por WhatsApp y se confirma a mano; dos personas en
  dispositivos distintos podrían, en teoría, pedir la misma hora.
- **Catálogo con ISR**: `/catalogo` se regenera cada 60 s (`revalidate = 60`) y
  las acciones del admin llaman a `revalidatePath`. El build **no exige**
  variables de Supabase: sin ellas, la tienda muestra "catálogo no disponible"
  y el resto del sitio funciona.
- **Categorías `modo = 'cotizar'`** (Servicios) no tienen carrito ni precio: el
  botón abre WhatsApp con `serviceQuoteMessage()`. Activar un producto de
  categoría `venta` es cargar precio + estado "disponible" en `/admin`; no
  requiere código (y un trigger en la BD impide "disponible" sin precio).
- **Correos transaccionales**: sin proveedor todavía; `notifyOrderPaid()` en
  `lib/server/notifications.ts` es el punto de enlace (stub documentado). No
  registres datos personales del cliente en los logs.
- **Sandbox vs. producción de Webpay**: lo decide `TRANSBANK_ENV`
  (`integration` por defecto, con credenciales de prueba del propio SDK). El
  checkout muestra un aviso de "modo de pruebas" en sandbox.
- **Hay avisos conocidos de `npm audit`** (PostCSS embebido en Next.js, sin
  arreglo fuera de Next 16). Ver README → Seguridad.

## Antes de publicar

- **Nunca hagas commit ni push sin que el usuario lo pida explícitamente en
  ese turno.** Mostrar el resultado en local (o describirlo) y esperar
  confirmación antes de publicar. Un push a `main` despliega en Vercel.
- Antes de proponer publicar: `npx tsc --noEmit`, `npm run lint` y
  `npm run build` deben pasar (el CI hace lo mismo).
- No commitees `.env*` (solo `.env.example`, sin valores reales) ni pegues
  claves en el código, en commits o en el chat.
- Si vas a hacer commit y ya pasó tiempo desde el último `git status`,
  corre `git fetch` primero: en este proyecto ha pasado que otra sesión (o
  un cambio hecho directo en GitHub) deja commits remotos que la copia
  local no tiene, y un `git push` a ciegas puede rechazarse o, peor,
  sobrescribir trabajo si se fuerza. Si el remoto tiene commits nuevos,
  revisa qué cambiaron (`git log --oneline <base>..origin/main` y
  `git show` de cada uno) antes de rebasar/mergear, porque pueden volver
  obsoleta información que acabas de escribir (como pasó con este mismo
  archivo).
