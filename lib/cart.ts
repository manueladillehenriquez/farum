import { z } from "zod";

/**
 * Carrito del navegador.
 *
 * Vive en localStorage y el usuario puede editarlo a mano, así que se trata
 * como entrada NO confiable: al leerlo se valida con Zod y se descarta lo
 * que no cumpla. Los precios que guarda son solo para mostrar; el monto
 * que se cobra lo recalcula siempre la base de datos.
 */

export const CART_STORAGE_KEY = "farum-cart-v1";
export const MAX_QTY = 99;

export const cartLineSchema = z.object({
  id: z.uuid(),
  cantidad: z.number().int().min(1).max(MAX_QTY),
  nombre: z.string().min(1).max(120),
  precio: z.number().int().min(1).max(20_000_000),
  imagen_url: z.string().max(500).nullable(),
  stock: z.number().int().min(0).nullable(),
});

export type CartLine = z.infer<typeof cartLineSchema>;

const cartSchema = z.array(cartLineSchema).max(50);

/** Lee y valida el carrito guardado. Ante cualquier anomalía → carrito vacío. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = cartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.precio * l.cantidad, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.cantidad, 0);
}

/** Cantidad máxima permitida para una línea según su stock conocido. */
export function maxQtyFor(line: Pick<CartLine, "stock">): number {
  return line.stock === null ? MAX_QTY : Math.max(0, Math.min(MAX_QTY, line.stock));
}
