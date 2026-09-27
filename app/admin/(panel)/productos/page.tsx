import Link from "next/link";
import { toggleProductActiveAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatCLP } from "@/lib/format";
import { adminButton, adminButtonGhost } from "@/components/admin/ui";

export const metadata = { title: "Productos" };

interface Row {
  id: string;
  nombre: string;
  precio: number | null;
  estado: string;
  stock: number | null;
  activo: boolean;
  category: { nombre: string; modo: string } | null;
}

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, nombre, precio, estado, stock, activo, category:categories(nombre, modo)")
    .order("nombre");
  const products = (data ?? []) as unknown as Row[];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-instrument-serif text-3xl">Productos</h1>
        <Link href="/admin/productos/nuevo" className={adminButton}>
          Nuevo producto
        </Link>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          No se pudieron cargar los productos.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-card/60">
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {p.precio !== null ? formatCLP(p.precio) : p.category?.modo === "cotizar" ? "Cotizar" : "—"}
                  </td>
                  <td className="px-4 py-3">{p.estado === "disponible" ? "Disponible" : "Próximamente"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.stock ?? "∞"}</td>
                  <td className="px-4 py-3">
                    <form action={toggleProductActiveAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="activo" value={String(p.activo)} />
                      <button type="submit" className={adminButtonGhost}>
                        {p.activo ? "Ocultar" : "Mostrar"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/productos/${p.id}`} className="text-accent hover:underline">
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
