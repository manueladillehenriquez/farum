import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, PackageCheck, XCircle } from "lucide-react";
import { ClearCartOnPaid } from "@/components/store/clear-cart-on-paid";
import { formatCLP, formatDateTime } from "@/lib/format";
import { getOrderByPublicToken } from "@/lib/server/orders";
import { siteConfig, waLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: false },
};

// Estado del pedido en vivo; nunca en caché.
export const dynamic = "force-dynamic";

/** "juan.perez@gmail.com" → "j***@gmail.com" (no se muestra el correo completo). */
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***";
  return `${user[0]}***@${domain}`;
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { order: copy } = siteConfig;
  const order = await getOrderByPublicToken(token);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-instrument-serif text-3xl text-foreground">{copy.notFoundTitle}</h1>
        <p className="mt-3 text-muted-foreground">{copy.notFoundDescription}</p>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--whatsapp-dark)]"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
    );
  }

  const status = {
    pagado: { icon: CheckCircle2, title: copy.paidTitle, text: copy.paidDescription, tone: "text-accent" },
    despachado: { icon: PackageCheck, title: copy.dispatchedTitle, text: copy.dispatchedDescription, tone: "text-accent" },
    fallido: { icon: XCircle, title: copy.failedTitle, text: copy.failedDescription, tone: "text-red-400" },
    pendiente: { icon: Clock, title: copy.pendingTitle, text: copy.pendingDescription, tone: "text-muted-foreground" },
  }[order.estado];
  const Icon = status.icon;
  const paid = order.estado === "pagado" || order.estado === "despachado";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {paid && <ClearCartOnPaid />}

      <div className="text-center">
        <Icon aria-hidden="true" className={`mx-auto h-12 w-12 ${status.tone}`} />
        <h1 className="mt-4 font-instrument-serif text-4xl text-foreground">{status.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{status.text}</p>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Pedido</dt>
            <dd className="mt-0.5 font-medium text-foreground">#{order.numero}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="mt-0.5 font-medium text-foreground">{formatDateTime(order.creado_en)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Comprador</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {order.nombre_cliente.split(" ")[0]} · {maskEmail(order.email)}
            </dd>
          </div>
        </dl>

        <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6 text-sm">
          {order.order_items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {item.cantidad} × {item.nombre_producto}
              </span>
              <span className="flex-none text-foreground">
                {formatCLP(item.precio_unitario * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
          <span className="text-muted-foreground">{paid ? "Total pagado" : "Total"}</span>
          <span className="text-2xl font-semibold text-foreground">{formatCLP(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order.estado === "fallido" && (
          <Link
            href="/carrito"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)]"
          >
            Volver al carrito
          </Link>
        )}
        <Link
          href="/catalogo"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
        >
          Seguir comprando
        </Link>
        <a
          href={waLink(`Hola ${siteConfig.businessName}, consulto por mi pedido #${order.numero}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--whatsapp-dark)]"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
