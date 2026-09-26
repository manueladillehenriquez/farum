import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, CategoryWithProducts, Product } from "@/lib/catalog-types";

const CATEGORY_COLUMNS = "id, slug, nombre, descripcion, orden, modo, activo";
const PRODUCT_COLUMNS =
  "id, category_id, nombre, descripcion, precio, sku, imagen_url, activo, estado, stock";

export type CatalogResult =
  | { status: "ok"; categories: CategoryWithProducts[] }
  | { status: "unavailable" };

/**
 * Catálogo público completo (categorías activas con sus productos activos).
 * Usa la clave anónima: RLS ya filtra lo que es visible. Si Supabase no
 * está configurado o falla, devuelve "unavailable" en vez de romper la página.
 */
export async function getCatalog(): Promise<CatalogResult> {
  const supabase = createPublicClient();
  if (!supabase) return { status: "unavailable" };

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select(CATEGORY_COLUMNS).order("orden"),
    supabase.from("products").select(PRODUCT_COLUMNS).order("nombre"),
  ]);

  if (categoriesRes.error || productsRes.error) {
    return { status: "unavailable" };
  }

  const products = (productsRes.data ?? []) as Product[];
  const categories = ((categoriesRes.data ?? []) as Category[]).map((c) => ({
    ...c,
    products: products.filter((p) => p.category_id === c.id),
  }));

  return { status: "ok", categories };
}

/** Productos por id (para refrescar precios del carrito). */
export async function getProductsByIds(ids: string[]) {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(`${PRODUCT_COLUMNS}, category:categories(modo, activo)`)
    .in("id", ids);

  if (error) return null;
  // El embed de una relación many-to-one llega como objeto (o null).
  return (data ?? []) as unknown as Product[];
}
