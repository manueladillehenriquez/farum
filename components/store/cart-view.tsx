"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { maxQtyFor } from "@/lib/cart";
import { trustedImageUrl } from "@/lib/catalog-types";
import { formatCLP } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export function CartView({ paymentError }: { paymentError: boolean }) {
  const { cart: copy } = siteConfig;
  const { lines, ready, subtotal, setQuantity, remove, refresh } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const refreshed = useRef(false);

  // Al abrir el carrito se sincronizan precios y stock con el servidor.
  useEffect(() => {
    if (!ready || refreshed.current) return;
    refreshed.current = true;
    refresh().then(({ removed, changed }) => {
      if (removed.length > 0) {
        setNotice(`Quitamos de tu carrito lo que ya no está disponible: ${removed.join(", ")}.`);
      } else if (changed) {
        setNotice("Actualizamos precios o cantidades de tu carrito.");
      }
    });
  }, [ready, refresh]);

  if (!ready) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Cargando…</p>;
  }

  return (
    <>
      {paymentError && (
        <p role="alert" className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
          {copy.paymentError}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-foreground">
          {notice}
        </p>
      )}

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">{copy.empty}</p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)]"
          >
            {copy.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <ul className="flex flex-col gap-4">
            {lines.map((line) => {
              const image = trustedImageUrl(line.imagen_url);
              const max = maxQtyFor(line);
              return (
                <li
                  key={line.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="relative flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-xl bg-background/60">
                    {image ? (
                      <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <Package aria-hidden="true" className="h-7 w-7 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{line.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCLP(line.precio)} · {siteConfig.catalog.vatNote}
                        </p>
                      </div>
                      <p className="flex-none font-semibold text-foreground">
                        {formatCLP(line.precio * line.cantidad)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.id, line.cantidad - 1)}
                          aria-label={`Quitar una unidad de ${line.nombre}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">
                          {line.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.id, line.cantidad + 1)}
                          disabled={line.cantidad >= max}
                          aria-label={`Agregar una unidad de ${line.nombre}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.id)}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{copy.subtotal}</span>
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {formatCLP(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{siteConfig.catalog.vatNote}</p>
            <p className="mt-4 text-xs text-muted-foreground">{copy.shippingNote}</p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)]"
            >
              {copy.checkoutButton}
            </Link>
            <Link
              href="/catalogo"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full px-6 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {copy.continueShopping}
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
