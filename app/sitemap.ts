import type { MetadataRoute } from "next";

// Requerido por Next.js para poder generar /sitemap.xml en un export estático.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.farum.cl/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
