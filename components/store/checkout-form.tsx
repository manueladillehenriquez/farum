"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { formatCLP } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { customerSchema } from "@/lib/validation/checkout";

type Fields = "nombre" | "email" | "telefono" | "direccion" | "comuna" | "notas";
type FieldErrors = Partial<Record<Fields, string>>;

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Envía al cliente a Webpay con un <form> POST (así lo exige Transbank). */
function redirectToWebpay(url: string, token: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "token_ws";
  input.value = token;
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
}

export function CheckoutForm({
  siteKey,
  sandbox,
}: {
  siteKey: string;
  sandbox: boolean;
}) {
  const { checkout: copy } = siteConfig;
  const { lines, ready, subtotal, refresh } = useCart();

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  if (!ready) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Cargando…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{siteConfig.cart.empty}</p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)]"
        >
          {siteConfig.cart.emptyCta}
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const raw = {
      nombre: String(data.get("nombre") ?? ""),
      email: String(data.get("email") ?? ""),
      telefono: String(data.get("telefono") ?? ""),
      direccion: String(data.get("direccion") ?? ""),
      comuna: String(data.get("comuna") ?? ""),
      notas: String(data.get("notas") ?? ""),
    };

    // Validación de cortesía (mismos esquemas que el servidor, que es el que cuenta).
    const parsed = customerSchema.safeParse(raw);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Fields;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    if (!captchaToken) {
      setFormError("Completa la verificación anti-bots antes de pagar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Solo IDs y cantidades: el precio nunca viaja desde el navegador.
        body: JSON.stringify({
          customer: raw,
          items: lines.map((l) => ({ product_id: l.id, cantidad: l.cantidad })),
          captchaToken,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok: true; url: string; token: string }
        | { ok: false; code?: string; message?: string; fieldErrors?: Record<string, string> }
        | null;

      if (res.ok && body && body.ok) {
        redirectToWebpay(body.url, body.token);
        return; // la página se reemplaza; se deja `submitting` activo
      }

      if (body && !body.ok) {
        if (body.fieldErrors) {
          const next: FieldErrors = {};
          for (const [path, message] of Object.entries(body.fieldErrors)) {
            const key = path.replace(/^customer\./, "") as Fields;
            next[key] = message;
          }
          setErrors(next);
        }
        setFormError(body.message ?? "No pudimos procesar tu pedido.");
        // Producto sin stock o ya no disponible: sincronizar el carrito.
        if (body.code === "PRODUCT_UNAVAILABLE" || body.code === "OUT_OF_STOCK") {
          await refresh();
        }
      } else {
        setFormError("No pudimos procesar tu pedido. Inténtalo de nuevo.");
      }
    } catch {
      setFormError("Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.");
    }
    // El token de Turnstile es de un solo uso: hay que pedir uno nuevo.
    setCaptchaToken("");
    setCaptchaReset((n) => n + 1);
    setSubmitting(false);
  }

  const field = (
    name: Fields,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={inputClass}
        {...props}
      />
      {errors[name] && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
        {sandbox && (
          <p className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs text-foreground">
            {copy.sandboxNote}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {field("nombre", "Nombre completo", { autoComplete: "name", maxLength: 100, required: true })}
          {field("email", "Correo electrónico", { type: "email", autoComplete: "email", maxLength: 254, required: true })}
          {field("telefono", "Teléfono", { type: "tel", autoComplete: "tel", placeholder: "+56 9 1234 5678", maxLength: 40, required: true })}
          {field("comuna", "Comuna", { autoComplete: "address-level2", maxLength: 80, required: true })}
        </div>
        {field("direccion", "Dirección de despacho", { autoComplete: "street-address", maxLength: 200, required: true })}

        <div>
          <label htmlFor="notas" className="mb-1.5 block text-sm font-medium text-foreground">
            Notas del pedido <span className="text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="notas"
            name="notas"
            rows={3}
            maxLength={500}
            className={inputClass}
            aria-invalid={errors.notas ? true : undefined}
          />
          {errors.notas && (
            <p role="alert" className="mt-1.5 text-xs text-red-400">{errors.notas}</p>
          )}
        </div>

        <TurnstileWidget siteKey={siteKey} onToken={setCaptchaToken} resetKey={captchaReset} />

        {formError && (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-foreground">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? copy.paying : `${copy.payButton} · ${formatCLP(subtotal)}`}
        </button>

        <p className="text-xs text-muted-foreground">{copy.secureNote}</p>
        <p className="text-xs text-muted-foreground">{copy.privacyNote}</p>
      </form>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6">
        <h2 className="font-instrument-serif text-xl text-foreground">Tu pedido</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {line.cantidad} × {line.nombre}
              </span>
              <span className="flex-none text-foreground">
                {formatCLP(line.precio * line.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">{siteConfig.cart.subtotal}</span>
          <span className="text-xl font-semibold text-foreground">{formatCLP(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{siteConfig.catalog.vatNote}</p>
        <p className="mt-4 text-xs text-muted-foreground">{siteConfig.cart.shippingNote}</p>
        <Link href="/carrito" className="mt-4 inline-block text-sm text-accent hover:underline">
          Editar carrito
        </Link>
      </aside>
    </div>
  );
}
