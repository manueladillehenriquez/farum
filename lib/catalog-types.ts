/**
 * Tipos y reglas del catálogo, compartidos entre servidor y cliente
 * (sin imports de servidor: es seguro usarlo en componentes cliente).
 */

export type CategoryModo = "venta" | "cotizar";
export type ProductEstado = "proximamente" | "disponible";

export interface Category {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  modo: CategoryModo;
  activo: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  nombre: string;
  descripcion: string | null;
  /** CLP entero, IVA incluido. null = aún sin precio. */
  precio: number | null;
  sku: string | null;
  imagen_url: string | null;
  activo: boolean;
  estado: ProductEstado;
  /** null = sin control de stock. */
  stock: number | null;
  category?: Pick<Category, "modo" | "activo"> | null;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

/** Qué muestra la tarjeta de un producto y qué botón lleva. */
export type ProductAction = "comprar" | "cotizar" | "proximamente" | "agotado";

/**
 * Regla única de "¿se puede comprar?". No requiere cambios de código para
 * activar un producto: basta cargar precio y estado "disponible" en /admin.
 * (El servidor la vuelve a verificar al crear el pedido — ver fn_create_order.)
 */
export function getProductAction(
  product: Pick<Product, "activo" | "estado" | "precio" | "stock">,
  modo: CategoryModo,
): ProductAction {
  if (modo === "cotizar") return "cotizar";
  if (!product.activo || product.estado !== "disponible" || product.precio == null) {
    return "proximamente";
  }
  if (product.stock !== null && product.stock <= 0) return "agotado";
  return "comprar";
}

/**
 * Solo se muestran imágenes que vienen de NUESTRO bucket de Supabase
 * Storage. Evita imágenes de terceros (rastreo) y URLs manipuladas, ya sea
 * en la base de datos o en el localStorage del carrito.
 */
export function trustedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const prefix = `${base.replace(/\/+$/, "")}/storage/v1/object/public/product-images/`;
  return url.startsWith(prefix) ? url : null;
}
