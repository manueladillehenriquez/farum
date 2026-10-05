# CLAUDE.md

Guía para trabajar en este proyecto: el sitio de **FARUM** (Next.js 15,
App Router, TypeScript, Tailwind v4, export estático), publicado en
`https://www.farum.cl/`.

## Regla #1: todo el contenido vive en `lib/site-config.ts`

Textos del hero, los 3 servicios, los planes de Google Ads, los pasos de "Cómo trabajamos", clientes,
sellos de "Por qué FARUM", prospección responsable, FAQ, datos de contacto,
horarios y mensajes de WhatsApp están centralizados ahí. Los componentes de `/components` solo
lo leen — **no** escribas copy a mano dentro de un componente si ya existe
(o debería existir) un campo en `site-config.ts` para eso. Si agregas
contenido nuevo, agrégalo primero a la config y luego consúmelo desde el
componente.

## Oferta (leerla siempre de acá, no de memoria)

Desde la reunión de socios del **2026-10-05** FARUM ofrece **tres servicios**
(detalle en `siteConfig.services` y `siteConfig.googleAds`, en
`lib/site-config.ts`):

1. **Prospección de clientes con IA.** Incluye agendamiento y confirmaciones
   (se fusionaron en un solo servicio). Se promociona con "100 correos diarios
   a público segmentado, con comunicación efectiva y no genérica". El cliente
   recibe cada reunión por WhatsApp para confirmarla; los horarios de
   disponibilidad se definen en la primera reunión de diagnóstico.
2. **Presencia digital:** indexación + sitemap, campañas de Google Ads (4
   planes) y tarjetas NFC.
3. **Software y apps:** se cotiza según el requerimiento.

**La web NO muestra precios** (decisión de los socios, 2026-10-05): los valores
se informan al cliente en la reunión de diagnóstico y viven solo en el manual
interno privado. No los agregues a la web, a `site-config.ts` ni a este repo
público. Tampoco cifras de clientes, "24/7" ni promesas de posicionamiento, de
ventas o de reuniones sin que el dueño las confirme, ni menciones el software
de prospección que se usa por dentro ni hables de "base de datos propia" (no lo
es). La oferta ha cambiado varias veces: **no copies nada de un chat, un README
viejo o una sesión anterior**.

## Dominio y publicación

- Dominio propio: `www.farum.cl`, DNS en Cloudflare, con `www` apuntando
  por CNAME a `manueladillehenriquez.github.io`. El repo es
  `manueladillehenriquez/farum` y se publica vía GitHub Pages.
- El sitio se sirve **desde la raíz** (sin `basePath`/`assetPrefix`) — eso
  solo aplicaba cuando se publicaba como repo de proyecto en
  `usuario.github.io/farum/`, antes de conectar el dominio propio. El
  mecanismo de `NEXT_PUBLIC_BASE_PATH` sigue en el código
  (`next.config.ts`, `lib/site-config.ts`) por si alguna vez vuelve a
  hacer falta, pero hoy queda vacío.
- Si el dominio cambia otra vez, hay que actualizar: `public/CNAME`,
  `app/layout.tsx` (`siteUrl`), `app/sitemap.ts`, `app/robots.ts`, y el
  campo "Custom domain" en Settings → Pages del repo en GitHub.
- `git push` a `main` dispara `.github/workflows/deploy.yml`, que hace el
  build y publica automáticamente. En Settings → Pages el origen debe ser
  **GitHub Actions** (el workflow sube un artefacto) y el "Custom domain"
  `www.farum.cl`, con "Enforce HTTPS" activado.
- Registros de Cloudflare que **no deben borrarse**: `A farum.cl → 192.0.2.1`
  (proxied) + la regla *Redirect from root to WWW* (hace que `farum.cl`
  redirija por 301 a `www`), y el `TXT google-site-verification` (propiedad de
  Search Console).
- **Nunca borres `CNAME`, `public/CNAME` ni `deploy.yml`, ni quites
  `output: "export"`, mientras el dominio dependa de GitHub Pages**: ya tumbó
  el sitio una vez (404 "Site not found").

## Historia: la tienda en Vercel quedó archivada

Entre el 2026-09-26 y el 2026-10-03 el sitio estuvo en **Vercel + Supabase**
con una tienda (catálogo, carrito, Webpay, panel `/admin`). Se descartó: el
hosting no acomodó y el nuevo giro (servicios B2B, ver abajo) no la necesita.
El código completo está en el **tag `tienda-v1`** (y la rama `feat/tienda`);
no se borra, pero ya no forma parte de `main`. El proyecto de Supabase y el
widget de Turnstile siguen existiendo en las cuentas del dueño. Si alguna vez
vuelve una tienda, se parte de ese tag y requiere un hosting con servidor.

## Nuevo giro

FARUM pasó de vender paquetes de presencia digital a pymes a ofrecer servicios
**B2B** por **suscripción mensual**, presupuestados a medida tras una reunión
(ver "Oferta"). La acción principal es **"Agenda tu reunión"**: abre WhatsApp
(+56 9 6460 5635) con un mensaje precargado; no hay calendario en el sitio. La
marca no cambia. Los manuales internos y speech de trabajo son **privados**:
este repo es público, no los guardes aquí.

El texto de la "Política de prospección responsable" (y su pregunta en la FAQ) es genérico y
está **pendiente de revisión legal**: no lo presentes como certificación de
cumplimiento de ninguna ley.

## Estructura

```
app/
  layout.tsx        Metadata SEO, JSON-LD, fuentes (next/font)
  page.tsx           Ensambla las secciones
  globals.css         Tema oscuro + paleta azul de marca (ver abajo)
  icon.png / apple-icon.png   Favicon (el faro, sobre fondo oscuro)
  sitemap.ts / robots.ts
components/
  ui/
    responsive-hero-banner.tsx   Hero: header, titular, CTA
    rotating-word.tsx            Palabra que alterna en el titular
    gateway-flow.tsx             Fondo animado del hero (ver abajo)
  sections/
    services-section.tsx     Los 3 servicios, tabla de planes de Google Ads y "Cotizar" por WhatsApp
    process-section.tsx      "Cómo trabajamos": 4 pasos
    clients-section.tsx      Logos de clientes + cupo "Tu empresa"
    why-us-section.tsx       "Por qué FARUM": sellos (solo los verdaderos)
    faq-section.tsx
    responsible-section.tsx  "Política de prospección responsable" (pendiente revisión legal)
    contact-section.tsx      Agenda tu reunión + QR + dirección, horarios y mapa
  site-footer.tsx
  site-signature.tsx   Firma "By Farum" fija, esquina inferior derecha
  whatsapp-fab.tsx     Botón flotante de WhatsApp
lib/
  site-config.ts   ⭐ Todo el contenido y los datos del negocio
  utils.ts          Helper cn() estándar de shadcn
public/
  CNAME      Dominio propio (www.farum.cl) para GitHub Pages
  brand/     Logos FARUM: horizontal/vertical × blanco/negro, más el ícono solo
  clients/   Logos de clientes (se registran en `siteConfig.clients`)
```

## Cosas no obvias que vale la pena saber antes de tocar código

- **Color de marca vs. WhatsApp**: el acento del sitio (`--color-accent`,
  usado en eyebrows, íconos, bordes activos, sellos, etc.) es **azul**
  (`--brand` en `globals.css`), no verde. El verde (`--whatsapp`) está
  reservado exclusivamente para lo relacionado con WhatsApp — el botón
  flotante, "Abrir WhatsApp", "Cotizar por WhatsApp", etc. usan
  `bg-[var(--whatsapp)]` explícito, no la clase de acento genérica. Si
  agregas un botón o ícono nuevo, piensa cuál de los dos le corresponde.
- **`site-signature.tsx`** es una firma de **texto** ("By Farum"), no una
  imagen de logo — una cinta oscura semitransparente fija en la esquina
  inferior derecha, debajo del botón de WhatsApp para no pisarlo.
- **`GatewayFlow` (fondo animado del hero)** es un `<iframe>` que carga
  Tailwind, GSAP e iconify desde CDNs — necesita internet para verse, y es
  pesado para lo que hace. Es decorativo (`aria-hidden`) y se congela con
  `prefers-reduced-motion`. Si el sitio se siente lento, este es el primer
  sospechoso.
- **`RotatingWord`** anima una palabra dentro del `<h1>` del hero (hoy:
  empresa / negocio / pyme), en la fuente Space Grotesk (`--font-space-
  grotesk`), distinta de la serif del titular. El `<h1>` real lleva la
  frase completa en un `sr-only` para buscadores y lectores de pantalla —
  la versión animada es puramente visual (`aria-hidden`). Si cambias el
  titular, edita `siteConfig.hero.title` / `rotatingWords` / `titleLine2`,
  no el JSX.
- **Número de WhatsApp**: vive solo en `siteConfig.whatsappNumber`; de ahí salen
  el botón flotante, el QR de contacto (se genera en el navegador con
  `qrcode`), todos los "Agenda tu reunión"/"Cotizar" y el `telephone` del
  JSON-LD de `app/layout.tsx`. No lo escribas a mano en ningún otro lado.
- **Export estático**: `next.config.ts` tiene `output: "export"` e
  `images.unoptimized: true` porque el sitio se sirve como HTML/CSS/JS
  plano. No se puede usar nada que dependa de un servidor Node corriendo
  (API routes, `next/image` con optimización en el servidor, etc.).

## Antes de publicar

- **Nunca hagas commit ni push sin que el usuario lo pida explícitamente en
  ese turno.** Mostrar el resultado en local (o describirlo) y esperar
  confirmación antes de publicar.
- Si vas a hacer commit y ya pasó tiempo desde el último `git status`,
  corre `git fetch` primero: en este proyecto ha pasado que otra sesión (o
  un cambio hecho directo en GitHub) deja commits remotos que la copia
  local no tiene, y un `git push` a ciegas puede rechazarse o, peor,
  sobrescribir trabajo si se fuerza. Si el remoto tiene commits nuevos,
  revisa qué cambiaron (`git log --oneline <base>..origin/main` y
  `git show` de cada uno) antes de rebasar/mergear, porque pueden volver
  obsoleta información que acabas de escribir (como pasó con este mismo
  archivo).
