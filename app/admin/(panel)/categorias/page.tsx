import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminButton } from "@/components/admin/ui";

export const metadata = { title: "Categorías" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, nombre, orden, modo, activo")
    .order("orden");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-instrument-serif text-3xl">Categorías</h1>
        <Link href="/admin/categorias/nueva" className={adminButton}>
          Nueva categoría
        </Link>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          No se pudieron cargar las categorías.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(categories ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-card/60">
                  <td className="px-4 py-3 text-muted-foreground">{c.orden}</td>
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3">{c.modo === "venta" ? "Venta" : "Cotizar"}</td>
                  <td className="px-4 py-3">{c.activo ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/categorias/${c.id}`} className="text-accent hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
