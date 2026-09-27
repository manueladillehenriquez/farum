import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas privadas o transaccionales: fuera de los buscadores.
      disallow: ["/admin", "/api/", "/carrito", "/checkout", "/pedido/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
