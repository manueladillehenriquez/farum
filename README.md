# FARUM — Next.js + TypeScript + Tailwind + shadcn

Sitio de **FARUM**: ayudamos a pymes a llevar su empresa al siguiente nivel.
La oferta son tres paquetes de pago único: **Inicial** (dominio + hosting +
página web + indexación en Google, con una tarjeta NFC de regalo), **Avanzado**
(suma 2 tarjetas NFC y una campaña de Google Ads) y **Full Pro** (Avanzado +
desarrollo de la App). Además, dos suscripciones mensuales de mantenimiento
(página, o página + App). Todos los precios llevan IVA incluido y están en
`lib/site-config.ts`.

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4**, con la
estructura de carpetas de **shadcn** (`/components/ui`, `/lib/utils.ts`,
`components.json`). El sitio se exporta como HTML/CSS/JS estático.

## Correrlo en local

Necesitas Node.js LTS ([nodejs.org](https://nodejs.org/es) o
`winget install OpenJS.NodeJS.LTS`). Luego:

```bash
npm install
npm run dev
```

y abre `http://localhost:3000`.

## Editar textos, precios y datos

**Casi todo el contenido vive en un solo archivo: [`lib/site-config.ts`](lib/site-config.ts)**
(nombre de marca, textos del hero, los 4 pilares, precios, FAQ, WhatsApp,
mensajes precargados, dirección, horarios, clientes y rutas de los logos).
Los componentes solo lo leen, así que para cambiar un precio o un texto
basta con editar ese archivo.

## Publicar

### GitHub Pages (lo que está configurado)

Cada `push` a `main` dispara [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
que hace el build estático y lo publica. Como el sitio se sirve desde un
subpath del repo, el workflow define `NEXT_PUBLIC_BASE_PATH` y
`next.config.ts` activa `basePath` solo en el build de GitHub Actions.

### Hosting tradicional (cPanel, Hostinger, etc.)

```bash
npm run build
```

Genera la carpeta `out/`. Sube **el contenido** de `out/` (no la carpeta) a
la raíz de tu hosting. En local el `basePath` queda vacío, así que ese build
sirve desde la raíz.

## Estructura

```
├── app/
│   ├── layout.tsx         Metadata SEO, JSON-LD, fuentes (next/font)
│   ├── page.tsx           Ensambla las secciones
│   ├── globals.css        Tema oscuro (variables de color/tipografía)
│   ├── icon.png           Favicon (faro sobre fondo oscuro)
│   ├── apple-icon.png     Ícono para iOS
│   ├── sitemap.ts         /sitemap.xml
│   └── robots.ts          /robots.txt
├── components/
│   ├── ui/
│   │   ├── responsive-hero-banner.tsx   Hero (header, titular, CTA)
│   │   ├── rotating-word.tsx            Palabra rotativa del titular
│   │   └── gateway-flow.tsx             Fondo animado del hero
│   ├── sections/
│   │   ├── services-section.tsx   4 pilares + precios
│   │   ├── clients-section.tsx    Clientes
│   │   ├── booking-section.tsx    Agenda de horas (con bloqueo de cupos)
│   │   ├── faq-section.tsx        Preguntas frecuentes
│   │   └── contact-section.tsx    WhatsApp + QR + aviso de seguridad
│   ├── site-footer.tsx
│   ├── site-signature.tsx  Sello de autoría (logo, esquina inferior derecha)
│   └── whatsapp-fab.tsx    Botón flotante de WhatsApp
├── lib/
│   ├── site-config.ts      ⭐ Contenido y datos del negocio
│   └── utils.ts            Helper cn() estándar de shadcn
└── public/
    ├── brand/              Logos FARUM (ver abajo)
    └── clients/            Logos de los clientes
```

## Marca y logos

Los logos están en [`public/brand/`](public/brand), en dos formatos y dos colores:

| Archivo | Uso |
|---|---|
| `farum-logo-horizontal-white.png` | Header (fondo oscuro) |
| `farum-logo-vertical-white.png` | Footer (fondo oscuro) |
| `farum-icon-white.png` | Solo el faro, blanco |
| `farum-logo-*-black.png`, `farum-icon-black.png` | Versiones negras, para fondos claros (impresos, documentos) |

Son PNG con fondo transparente, generados a partir del logo original. Si más
adelante tienes los logos en vectorial (SVG), conviene reemplazarlos: se
verán nítidos a cualquier tamaño.

## Notas técnicas

- **Fondo del hero (`GatewayFlow`)**: es un `<iframe>` que carga scripts desde
  CDNs (Tailwind, GSAP, iconify), así que necesita conexión a internet para
  mostrarse. Es decorativo (`aria-hidden`) y se congela si el usuario tiene
  activada la opción de reducir animaciones.
- **Agenda**: el bloqueo de horarios usa `localStorage`, es decir, es por
  navegador y no hay backend compartido. Sirve porque cada reserva llega por
  WhatsApp y se confirma a mano, pero no evita que dos personas en
  dispositivos distintos pidan la misma hora.
- **Repo y URL**: el repositorio es `manueladillehenriquez/farum` y el sitio se
  publica en `https://manueladillehenriquez.github.io/farum/`. Ese nombre
  aparece en cinco lugares que deben mantenerse iguales: `next.config.ts`
  (`repoName`), el workflow (`NEXT_PUBLIC_BASE_PATH`), `app/layout.tsx`
  (`siteUrl`), `app/sitemap.ts` y `app/robots.ts`. Si renombras el repo otra
  vez o conectas un dominio propio, hay que actualizar esos cinco lugares.
