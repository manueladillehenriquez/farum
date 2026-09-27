import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy.
// - 'unsafe-inline' en script-src: Next.js inyecta scripts inline para la
//   hidratación y el hero (GatewayFlow) usa un <iframe srcDoc> con scripts
//   inline; una CSP con nonce obligaría a renderizar TODAS las páginas de
//   forma dinámica. El riesgo se compensa porque React escapa todo el
//   contenido, no hay dangerouslySetInnerHTML con datos de usuarios y las
//   entradas se validan/sanitizan en el servidor (ver lib/security).
// - Los hosts de CDN de script-src/style-src/img-src/connect-src existen
//   SOLO para GatewayFlow (ver components/ui/gateway-flow.tsx): un srcDoc
//   hereda la CSP de la página que lo contiene.
// - challenges.cloudflare.com: widget Cloudflare Turnstile (anti-bots).
// - form-action: Webpay se abre enviando un <form> POST a Transbank.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://code.iconify.design`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://cdn.21st.dev",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://challenges.cloudflare.com https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com",
  "frame-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://webpay3gint.transbank.cl https://webpay3g.transbank.cl",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS: 2 años. Sin `preload` a propósito (compromiso difícil de revertir).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
];

const noStoreHeaders = [
  { key: "Cache-Control", value: "no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  // Sin `output: "export"`: el sitio ahora es una app Next.js completa
  // (API routes, server components, server actions) desplegada en Vercel.
  poweredByHeader: false,
  // El SDK de Transbank es CommonJS (ES5): se carga tal cual en el servidor
  // en vez de pasarlo por el bundler.
  serverExternalPackages: ["transbank-sdk"],
  images: {
    // Imágenes de productos subidas por el panel admin a Supabase Storage
    // (bucket público `product-images`). Cualquier otro host queda bloqueado.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Rutas privadas / transaccionales: nunca en caché ni en buscadores.
      { source: "/admin/:path*", headers: noStoreHeaders },
      { source: "/api/:path*", headers: noStoreHeaders },
      { source: "/pedido/:path*", headers: noStoreHeaders },
      { source: "/checkout", headers: noStoreHeaders },
      { source: "/carrito", headers: noStoreHeaders },
    ];
  },
};

export default nextConfig;
