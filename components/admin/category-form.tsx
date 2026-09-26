"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveCategoryAction, type FormState } from "@/app/admin/actions";
import { adminButton, adminButtonGhost, adminInput, Field } from "@/components/admin/ui";
import type { Category } from "@/lib/catalog-types";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategoryAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5 rounded-2xl border border-border bg-card p-6">
      {category && <input type="hidden" name="id" value={category.id} />}

      <Field label="Nombre" name="nombre" error={fe.nombre}>
        <input id="nombre" name="nombre" defaultValue={category?.nombre} required maxLength={80} className={adminInput} />
      </Field>

      <Field
        label="Slug (URL)"
        name="slug"
        error={fe.slug}
        hint="Solo minúsculas, números y guiones. Ej.: aseo, tarjetas-y-sellos. Cambiarlo cambia la URL de la categoría."
      >
        <input id="slug" name="slug" defaultValue={category?.slug} required maxLength={60} className={adminInput} />
      </Field>

      <Field label="Descripción" name="descripcion" error={fe.descripcion}>
        <textarea id="descripcion" name="descripcion" rows={3} defaultValue={category?.descripcion ?? ""} maxLength={500} className={adminInput} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Orden" name="orden" error={fe.orden} hint="Menor número aparece primero.">
          <input id="orden" name="orden" inputMode="numeric" defaultValue={category?.orden ?? 0} className={adminInput} />
        </Field>
        <Field
          label="Tipo"
          name="modo"
          error={fe.modo}
          hint="“Venta” tiene precio y carrito. “Cotizar” muestra el botón de WhatsApp."
        >
          <select id="modo" name="modo" defaultValue={category?.modo ?? "venta"} className={adminInput}>
            <option value="venta">Venta (carrito y pago)</option>
            <option value="cotizar">Cotizar (WhatsApp)</option>
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" defaultChecked={category?.activo ?? true} className="h-4 w-4 accent-[var(--brand)]" />
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
        <Link href="/admin/categorias" className={adminButtonGhost}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
