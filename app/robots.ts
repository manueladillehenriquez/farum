import type { MetadataRoute } from "next";

// Requerido por Next.js para poder generar /robots.txt en un export estático.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.farum.cl/sitemap.xml",
  };
}
