"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveProductAction, type FormState } from "@/app/admin/actions";
import { adminButton, adminButtonGhost, adminInput, Field } from "@/components/admin/ui";
import { trustedImageUrl, type Category, type Product } from "@/lib/catalog-types";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Pick<Category, "id" | "nombre" | "modo">[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const fe = state.fieldErrors ?? {};
  const currentImage = trustedImageUrl(product?.imagen_url);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5 rounded-2xl border border-border bg-card p-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Field label="Categoría" name="category_id" error={fe.category_id}>
        <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} required className={adminInput}>
          <option value="" disabled>
            Elige una categoría…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.modo === "cotizar" ? "(cotizar)" : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nombre" name="nombre" error={fe.nombre}>
        <input id="nombre" name="nombre" defaultValue={product?.nombre} required maxLength={120} className={adminInput} />
      </Field>

      <Field label="Descripción" name="descripcion" error={fe.descripcion}>
        <textarea id="descripcion" name="descripcion" rows={4} defaultValue={product?.descripcion ?? ""} maxLength={1000} className={adminInput} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Precio (CLP, IVA incluido)"
          name="precio"
          error={fe.precio}
          hint="Número entero sin puntos. Déjalo vacío si aún no tiene precio o si es un servicio a cotizar."
        >
          <input id="precio" name="precio" inputMode="numeric" defaultValue={product?.precio ?? ""} placeholder="12990" className={adminInput} />
        </Field>
        <Field label="Stock" name="stock" error={fe.stock} hint="Vacío = sin control de stock (siempre disponible).">
          <input id="stock" name="stock" inputMode="numeric" defaultValue={product?.stock ?? ""} className={adminInput} />
        </Field>
        <Field label="SKU" name="sku" error={fe.sku} hint="Opcional. Letras, números, . _ y -">
          <input id="sku" name="sku" defaultValue={product?.sku ?? ""} maxLength={40} className={adminInput} />
        </Field>
        <Field
          label="Estado"
          name="estado"
          error={fe.estado}
          hint="“Disponible” con precio activa la compra; “Próximamente” la deshabilita."
        >
          <select id="estado" name="estado" defaultValue={product?.estado ?? "proximamente"} className={adminInput}>
            <option value="proximamente">Próximamente</option>
            <option value="disponible">Disponible</option>
          </select>
        </Field>
      </div>

      <Field
        label="Imagen"
        name="imagen"
        error={fe.imagen}
        hint="JPG, PNG o WebP, máximo 2 MB. Se valida el contenido real del archivo."
      >
        {currentImage && (
          <div className="mb-3 flex items-center gap-4">
            <Image src={currentImage} alt="" width={96} height={72} className="h-18 w-24 rounded-lg object-cover" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="quitar_imagen" className="h-4 w-4 accent-[var(--brand)]" />
              Quitar imagen actual
            </label>
          </div>
        )}
        <input
          id="imagen"
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-background file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" defaultChecked={product?.activo ?? true} className="h-4 w-4 accent-[var(--brand)]" />
        Visible en el sitio
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={adminButton}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/productos" className={adminButtonGhost}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
