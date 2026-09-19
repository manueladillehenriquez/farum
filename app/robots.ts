import type { MetadataRoute } from "next";

// Requerido por Next.js para poder generar /robots.txt en un export estático.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    // TODO: actualiza esto cuando conectes un dominio propio.
    sitemap: "https://manueladillehenriquez.github.io/farum/sitemap.xml",
  };
}
