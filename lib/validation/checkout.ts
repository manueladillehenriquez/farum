import { z } from "zod";
import "@/lib/validation/zod-locale";
import { sanitizeLine, sanitizeMultiline } from "@/lib/security/sanitize";

/**
 * Esquemas del checkout. Se usan en dos lados:
 *   - el formulario (para mostrar errores al instante), y
 *   - el API route del servidor (la validación que REALMENTE cuenta).
 * Como ambos usan el mismo esquema, no pueden divergir.
 */

/** Texto de una línea: se sanitiza y luego se valida el largo. */
const line = (min: number, max: number, label: string) =>
  z
    .string()
    .max(max * 2, `${label}: máximo ${max} caracteres.`)
    .transform(sanitizeLine)
    .pipe(
      z
        .string()
        .min(min, `${label}: mínimo ${min} caracteres.`)
        .max(max, `${label}: máximo ${max} caracteres.`),
    );

/** Teléfono: se quitan espacios/guiones/paréntesis y se valida el resto. */
const phone = z
  .string()
  .max(40, "El teléfono no es válido.")
  .transform((v) => v.replace(/[\s()\-.]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^\+?\d{8,15}$/, "Ingresa un teléfono válido (ej. +56 9 1234 5678)."),
  );

export const customerSchema = z.object({
  nombre: line(2, 100, "Nombre"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "El correo es demasiado largo.")
    .pipe(z.email("Ingresa un correo válido.")),
  telefono: phone,
  direccion: line(5, 200, "Dirección"),
  comuna: line(2, 80, "Comuna"),
  notas: z
    .string()
    .max(1000)
    .transform(sanitizeMultiline)
    .pipe(z.string().max(500, "Las notas son demasiado largas (máx. 500)."))
    .optional()
    .default(""),
});

export const cartItemSchema = z.object({
  product_id: z.uuid("Producto inválido."),
  cantidad: z
    .number("Cantidad inválida.")
    .int("Cantidad inválida.")
    .min(1, "La cantidad mínima es 1.")
    .max(99, "La cantidad máxima es 99."),
});

export const checkoutRequestSchema = z.object({
  customer: customerSchema,
  items: z.array(cartItemSchema).min(1, "Tu carrito está vacío.").max(50),
  captchaToken: z
    .string("Completa la verificación anti-bots.")
    .min(1, "Completa la verificación anti-bots.")
    .max(2048),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CheckoutRequest = z.output<typeof checkoutRequestSchema>;

/** Para refrescar precios del carrito (endpoint público, solo IDs). */
export const cartRefreshSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(50),
});
