# CLAUDE.md

Guía para trabajar en este proyecto: el sitio de **FARUM** (Next.js 15,
App Router, TypeScript, Tailwind v4, export estático), publicado en
`https://www.farum.cl/`.

## Regla #1: todo el contenido vive en `lib/site-config.ts`

Precios, textos del hero, los pilares de "El siguiente nivel", los sellos de
"¿Por qué elegirnos?", FAQ, datos de contacto, horarios, clientes y mensajes
de WhatsApp están centralizados ahí. Los componentes de `/components` solo
lo leen — **no** escribas copy a mano dentro de un componente si ya existe
(o debería existir) un campo en `site-config.ts` para eso. Si agregas
contenido nuevo, agrégalo primero a la config y luego consúmelo desde el
componente.

## Oferta y precios (leerlos siempre de acá, no de memoria)

La oferta actual son **3 paquetes de pago único + 2 suscripciones
mensuales**, todos con **IVA incluido**. Los montos y qué incluye cada uno
están en `siteConfig.pricing` (`lib/site-config.ts`), como constantes
(`INITIAL_PRICE`, `ADVANCED_PRICE`, `FULL_PRO_PRICE`, `APP_PRICE`,
`MONTHLY_PRICE`, `MONTHLY_APP_PRICE`) arriba del archivo. La oferta ha
cambiado varias veces en esta misma etapa del proyecto (nombres de planes,
qué incluye cada uno, qué es "de regalo" vs. "servicio aparte", y los
precios mismos) — **no copies un precio de un chat, un README viejo o una
sesión anterior**: léelo del archivo en el momento.

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
  build y publica automáticamente.

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
    services-section.tsx   Los 4 pilares + los paquetes + las suscripciones
    clients-section.tsx    Nuestros clientes
    why-us-section.tsx     "¿Por qué elegirnos?": sellos de garantía
    booking-section.tsx    Agenda de horas (localStorage, ver abajo)
    faq-section.tsx
    contact-section.tsx    WhatsApp + QR + aviso antifraude
  site-footer.tsx
  site-signature.tsx   Firma "By Farum" fija, esquina inferior derecha
  whatsapp-fab.tsx     Botón flotante de WhatsApp
lib/
  site-config.ts   ⭐ Todo el contenido y los datos del negocio
  utils.ts          Helper cn() estándar de shadcn
public/
  CNAME      Dominio propio (www.farum.cl) para GitHub Pages
  brand/     Logos FARUM: horizontal/vertical × blanco/negro, más el ícono solo
  clients/   Logos de los clientes
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
- **Agenda (`booking-section.tsx`)**: el bloqueo de horarios usa
  `localStorage`, es decir, es por navegador — no hay backend compartido.
  Cada reserva llega por WhatsApp y se confirma a mano; dos personas en
  dispositivos distintos podrían, en teoría, pedir la misma hora.
- **Logos de clientes**: cada cliente tiene un `logoBg` en `site-config.ts`.
  El círculo que lo envuelve usa ese color de fondo (no siempre blanco):
  si el logo tiene bordes semi-transparentes y el fondo no coincide con el
  color real del logo, se ve una línea del color equivocado en el borde
  (pasó con el logo de Zona Trofeos, que es burdeo, no blanco).
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
