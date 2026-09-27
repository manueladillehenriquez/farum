import { z } from "zod";
import "@/lib/validation/zod-locale";
import { sanitizeLine, sanitizeMultiline } from "@/lib/security/sanitize";

/**
 * Esquemas de las acciones del panel admin. Cada Server Action valida
 * TODO con estos esquemas antes de tocar la base de datos.
 */

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

const optionalMultiline = (max: number, label: string) =>
  z
    .string()
    .max(max * 2)
    .transform(sanitizeMultiline)
    .pipe(z.string().max(max, `${label}: máximo ${max} caracteres.`))
    .transform((v) => (v === "" ? null : v));

/** Checkbox de formulario: "on" (marcado) → true; ausente → false. */
const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.null(), z.undefined()])
  .transform((v) => v === "on" || v === "true");

/** Entero opcional desde un input de texto: "" → null. */
const optionalInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(
      z
        .string()
        .regex(/^\d+$/, `${label} debe ser un número entero.`)
        .transform(Number)
        .pipe(z.number().int().min(min, `${label} mínimo ${min}.`).max(max, `${label} máximo ${max}.`))
        .nullable(),
    );

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo admite minúsculas, números y guiones.")
  .max(60);

export const categorySchema = z.object({
  nombre: line(2, 80, "Nombre"),
  slug: slugSchema,
  descripcion: optionalMultiline(500, "Descripción"),
  orden: z
    .string()
    .trim()
    .regex(/^-?\d{1,4}$/, "El orden debe ser un número.")
    .transform(Number),
  modo: z.enum(["venta", "cotizar"]),
  activo: checkbox,
});

export const productSchema = z
  .object({
    category_id: z.uuid("Elige una categoría."),
    nombre: line(2, 120, "Nombre"),
    descripcion: optionalMultiline(1000, "Descripción"),
    // Precio en CLP entero (IVA incluido). Vacío = sin precio (próximamente).
    precio: optionalInt("El precio", 1, 20_000_000),
    sku: z
      .string()
      .trim()
      .max(40)
      .regex(/^[A-Za-z0-9._-]*$/, "El SKU solo admite letras, números, . _ y -")
      .transform((v) => (v === "" ? null : v)),
    estado: z.enum(["proximamente", "disponible"]),
    stock: optionalInt("El stock", 0, 1_000_000),
    activo: checkbox,
  });

export const orderStatusSchema = z.object({
  id: z.uuid(),
  estado: z.enum(["pagado", "despachado"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Correo inválido.")),
  password: z.string().min(1, "Ingresa tu contraseña.").max(200),
});

export const orderFiltersSchema = z.object({
  estado: z.enum(["pendiente", "pagado", "fallido", "despachado"]).optional().catch(undefined),
  desde: z.iso.date().optional().catch(undefined),
  hasta: z.iso.date().optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
});
