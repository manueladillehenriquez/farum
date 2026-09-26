"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { checkImageFile } from "@/lib/security/image-upload";
import { createSessionClient } from "@/lib/supabase/session";
import { categorySchema, orderStatusSchema, productSchema } from "@/lib/validation/admin";

/**
 * Server Actions del panel admin.
 *
 * Reglas que cumplen TODAS:
 *   - Empiezan con requireAdmin(): verifican la sesión en el servidor.
 *   - Validan cada campo con Zod antes de tocar la base.
 *   - Operan con el cliente de la SESIÓN del admin, no con service_role:
 *     la base de datos sigue aplicando RLS aunque el código tuviera un bug.
 *   - Next.js verifica el Origin de las Server Actions (protección CSRF).
 */

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

/** Errores de Postgres → mensajes claros (sin filtrar detalles internos). */
function dbErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code === "23505") return "Ya existe un registro con ese slug o SKU.";
  if (error.code === "23514" || /requiere precio/i.test(error.message ?? "")) {
    return "Un producto disponible de una categoría de venta requiere precio.";
  }
  if (error.code === "23503") return "No se puede borrar: hay datos que dependen de este registro.";
  if (error.code === "42501") return "No tienes permiso para esta operación.";
  return "No se pudo guardar. Inténtalo de nuevo.";
}

function revalidateStore() {
  revalidatePath("/catalogo", "layout");
  revalidatePath("/admin", "layout");
}

const BUCKET = "product-images";

/** Ruta del objeto dentro del bucket a partir de su URL pública. */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

// ---------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------
export async function logoutAction() {
  const supabase = await createSessionClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------
export async function updateOrderStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = orderStatusSchema.safeParse({
    id: formData.get("id"),
    estado: formData.get("estado"),
  });
  if (!parsed.success) return;

  // La BD solo permite pagado <-> despachado (trigger orders_guard_estado);
  // el pago en sí lo decide únicamente Webpay desde el servidor.
  await supabase.from("orders").update({ estado: parsed.data.estado }).eq("id", parsed.data.id);

  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------
export async function saveCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw !== "" ? idRaw : null;

  const parsed = categorySchema.safeParse({
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion") ?? "",
    orden: formData.get("orden") ?? "0",
    modo: formData.get("modo"),
    activo: formData.get("activo"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: zodFieldErrors(parsed.error) };
  }

  const result = id
    ? await supabase.from("categories").update(parsed.data).eq("id", id)
    : await supabase.from("categories").insert(parsed.data);

  if (result.error) return { error: dbErrorMessage(result.error) };

  revalidateStore();
  redirect("/admin/categorias");
}

// ---------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------
export async function saveProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw !== "" ? idRaw : null;

  const parsed = productSchema.safeParse({
    category_id: formData.get("category_id"),
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") ?? "",
    precio: formData.get("precio") ?? "",
    sku: formData.get("sku") ?? "",
    estado: formData.get("estado"),
    stock: formData.get("stock") ?? "",
    activo: formData.get("activo"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const values = parsed.data;

  // Regla amigable (la BD también la exige con un trigger).
  const { data: category } = await supabase
    .from("categories")
    .select("modo")
    .eq("id", values.category_id)
    .maybeSingle();
  if (!category) return { error: "La categoría no existe.", fieldErrors: { category_id: "Elige una categoría válida." } };

  if (category.modo === "venta" && values.estado === "disponible" && values.precio === null) {
    return {
      error: "Para dejar un producto como “disponible” debes cargar su precio.",
      fieldErrors: { precio: "Requerido si el producto está disponible." },
    };
  }

  // Imagen: nunca se acepta una URL escrita a mano; solo un archivo que
  // pasa la validación de contenido real y se sube a NUESTRO bucket.
  let imagen_url: string | null | undefined;
  let previousUrl: string | null = null;

  if (id) {
    const { data: current } = await supabase
      .from("products")
      .select("imagen_url")
      .eq("id", id)
      .maybeSingle();
    previousUrl = current?.imagen_url ?? null;
  }

  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const check = await checkImageFile(file);
    if (!check.ok) {
      return { error: check.error, fieldErrors: { imagen: check.error } };
    }
    // Nombre aleatorio: no se usa el nombre del archivo del usuario.
    const path = `${randomUUID()}.${check.image.ext}`;
    const upload = await supabase.storage
      .from(BUCKET)
      .upload(path, check.bytes, { contentType: check.image.mime, upsert: false });
    if (upload.error) {
      return { error: "No se pudo subir la imagen.", fieldErrors: { imagen: "Error al subir la imagen." } };
    }
    imagen_url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } else if (formData.get("quitar_imagen") === "on") {
    imagen_url = null;
  }

  const row = { ...values, ...(imagen_url !== undefined ? { imagen_url } : {}) };

  const result = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);

  if (result.error) {
    // Si el guardado falló, no dejar la imagen recién subida huérfana.
    if (imagen_url) {
      const orphan = storagePathFromUrl(imagen_url);
      if (orphan) await supabase.storage.from(BUCKET).remove([orphan]);
    }
    return { error: dbErrorMessage(result.error) };
  }

  // Guardado OK: borrar la imagen anterior si se reemplazó o se quitó.
  if (imagen_url !== undefined && previousUrl && previousUrl !== imagen_url) {
    const old = storagePathFromUrl(previousUrl);
    if (old) await supabase.storage.from(BUCKET).remove([old]);
  }

  revalidateStore();
  redirect("/admin/productos");
}

export async function toggleProductActiveAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id");
  const activo = formData.get("activo") === "true";
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return;

  await supabase.from("products").update({ activo: !activo }).eq("id", id);
  revalidateStore();
}
