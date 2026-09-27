import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { applyOrderFilters } from "@/lib/admin-queries";
import { formatCLP, formatDateTime } from "@/lib/format";
import { orderFiltersSchema } from "@/lib/validation/admin";
import { OrderFilters } from "@/components/admin/order-filters";

export const metadata = { title: "Clientes" };

// Tope de pedidos a agregar en memoria. Para el volumen esperado de una
// pyme alcanza de sobra; si crece, mover el agrupado a una vista SQL.
const MAX_ORDERS = 2000;

interface Row {
  email: string;
  nombre: string;
  telefono: string;
  comuna: string;
  pedidos: number;
  total: number;
  ultimo: string;
}

export default async function AdminCustomersPage({
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

  // Por defecto solo cuentan compras reales (pagadas o despachadas).
  const query = applyOrderFilters(
    supabase
      .from("orders")
      .select("email, nombre_cliente, telefono, comuna, total, creado_en, estado")
      .order("creado_en", { ascending: false })
      .limit(MAX_ORDERS),
    filters,
  );
  const { data: orders, error } = await (filters.estado
    ? query
    : query.in("estado", ["pagado", "despachado"]));

  const byEmail = new Map<string, Row>();
  for (const o of orders ?? []) {
    const key = o.email.toLowerCase();
    const row = byEmail.get(key);
    if (row) {
      row.pedidos += 1;
      row.total += o.total;
      // Los pedidos vienen del más nuevo al más antiguo: el primero manda.
    } else {
      byEmail.set(key, {
        email: o.email,
        nombre: o.nombre_cliente,
        telefono: o.telefono,
        comuna: o.comuna,
        pedidos: 1,
        total: o.total,
        ultimo: o.creado_en,
      });
    }
  }
  const customers = [...byEmail.values()].sort((a, b) => b.total - a.total);

  return (
    <>
      <h1 className="mb-2 font-instrument-serif text-3xl">Clientes</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Compradores agrupados por correo. Por defecto solo se cuentan pedidos pagados o despachados.
      </p>
      <OrderFilters action="/admin/clientes" values={filters} />

      {error ? (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          No se pudieron cargar los clientes.
        </p>
      ) : customers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay clientes con esos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Comuna</th>
                <th className="px-4 py-3 text-right">Pedidos</th>
                <th className="px-4 py-3 text-right">Total comprado</th>
                <th className="px-4 py-3">Última compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-card/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.nombre}</div>
                    <Link
                      href={`/admin?q=${encodeURIComponent(c.email)}`}
                      className="text-xs text-accent hover:underline"
                    >
                      {c.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.telefono}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.comuna}</td>
                  <td className="px-4 py-3 text-right">{c.pedidos}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCLP(c.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(c.ultimo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
