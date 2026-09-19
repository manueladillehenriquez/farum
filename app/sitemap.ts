import type { MetadataRoute } from "next";

// Requerido por Next.js para poder generar /sitemap.xml en un export estático.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // TODO: actualiza esto cuando conectes un dominio propio.
      url: "https://manueladillehenriquez.github.io/farum/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
