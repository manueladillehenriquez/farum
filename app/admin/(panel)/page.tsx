import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { applyOrderFilters } from "@/lib/admin-queries";
import { formatCLP, formatDateTime } from "@/lib/format";
import { orderFiltersSchema } from "@/lib/validation/admin";
import { EstadoBadge } from "@/components/admin/ui";
import { OrderFilters } from "@/components/admin/order-filters";

export const metadata = { title: "Pedidos" };

const LIMIT = 100;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const raw = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const filters = orderFiltersSchema.parse({
    estado: first(raw.estado) || undefined,
    desde: first(raw.desde) || undefined,
    hasta: first(raw.hasta) || undefined,
    q: first(raw.q) || undefined,
  });

  const query = applyOrderFilters(
    supabase
      .from("orders")
      .select("id, numero, creado_en, estado, nombre_cliente, email, comuna, total", {
        count: "exact",
      })
      .order("creado_en", { ascending: false })
      .limit(LIMIT),
    filters,
  );
  const { data: orders, count, error } = await query;

  return (
    <>
      <h1 className="mb-6 font-instrument-serif text-3xl">Pedidos</h1>
      <OrderFilters action="/admin" values={filters} />

      {error ? (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          No se pudieron cargar los pedidos.
        </p>
      ) : !orders || orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay pedidos con esos filtros.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">N.º</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Comuna</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-card/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${o.id}`} className="font-medium text-accent hover:underline">
                        #{o.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(o.creado_en)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.nombre_cliente}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.comuna}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={o.estado} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCLP(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Mostrando {orders.length} de {count ?? orders.length} pedidos
            {(count ?? 0) > LIMIT ? " (usa los filtros para acotar)" : ""}.
          </p>
        </>
      )}
    </>
  );
}
