import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/env";

// Se regenera cada hora: incluye las categorías activas del catálogo.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  // Si Supabase no está disponible, el sitemap igual sale con lo estático.
  const catalog = await getCatalog();
  if (catalog.status === "ok") {
    for (const category of catalog.categories) {
      entries.push({
        url: `${SITE_URL}/catalogo/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
