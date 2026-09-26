import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatCLP, formatDateTime } from "@/lib/format";
import { EstadoBadge, adminButton } from "@/components/admin/ui";

export const metadata = { title: "Detalle del pedido" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, numero, creado_en, pagado_en, estado, nombre_cliente, email, telefono, direccion, comuna, notas, total, transbank_order_id, transbank_authorization_code, order_items(id, nombre_producto, cantidad, precio_unitario)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const row = (label: string, value: string | null) => (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm">{value || "—"}</dd>
    </div>
  );

  return (
    <>
      <Link href="/admin" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Pedidos
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-instrument-serif text-3xl">Pedido #{order.numero}</h1>
        <EstadoBadge estado={order.estado} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-instrument-serif text-xl">Cliente y despacho</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {row("Nombre", order.nombre_cliente)}
            {row("Correo", order.email)}
            {row("Teléfono", order.telefono)}
            {row("Comuna", order.comuna)}
            <div className="sm:col-span-2">{row("Dirección", order.direccion)}</div>
            <div className="sm:col-span-2">{row("Notas del cliente", order.notas)}</div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-instrument-serif text-xl">Pago</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {row("Creado", formatDateTime(order.creado_en))}
            {row("Pagado", order.pagado_en ? formatDateTime(order.pagado_en) : null)}
            {row("Orden de compra (Transbank)", order.transbank_order_id)}
            {row("Código de autorización", order.transbank_authorization_code)}
          </dl>

          {(order.estado === "pagado" || order.estado === "despachado") && (
            <form action={updateOrderStatusAction} className="mt-6 border-t border-border pt-6">
              <input type="hidden" name="id" value={order.id} />
              <input
                type="hidden"
                name="estado"
                value={order.estado === "pagado" ? "despachado" : "pagado"}
              />
              <button type="submit" className={adminButton}>
                {order.estado === "pagado" ? "Marcar como despachado" : "Volver a “pagado”"}
              </button>
            </form>
          )}
          {order.estado === "pendiente" && (
            <p className="mt-6 border-t border-border pt-6 text-xs text-muted-foreground">
              Pendiente: aún no hay confirmación de Webpay. Si pasó más de una hora y el cliente
              dice que le cobraron, revisa la transacción en el portal de Transbank con la orden
              de compra.
            </p>
          )}
        </section>
      </div>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[30rem] text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-right">Cant.</th>
              <th className="px-4 py-3 text-right">Precio unit.</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.nombre_producto}</td>
                <td className="px-4 py-3 text-right">{item.cantidad}</td>
                <td className="px-4 py-3 text-right">{formatCLP(item.precio_unitario)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(item.precio_unitario * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-card">
              <td colSpan={3} className="px-4 py-3 text-right font-medium">
                Total (IVA incluido)
              </td>
              <td className="px-4 py-3 text-right text-base font-semibold">{formatCLP(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </>
  );
}
