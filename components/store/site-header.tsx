"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useCart } from "@/components/cart/cart-provider";

/**
 * Cabecera de las páginas de la tienda (catálogo, carrito, checkout, pedido).
 * La portada tiene su propio header dentro del hero.
 */
export function SiteHeader() {
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" aria-label={siteConfig.businessName} className="inline-flex items-center">
          <Image
            src={siteConfig.brand.logoHorizontal}
            alt={siteConfig.businessName}
            width={592}
            height={146}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrito"
            aria-label={`Carrito${ready && count > 0 ? `, ${count} artículos` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent"
          >
            <ShoppingCart className="h-5 w-5" />
            {ready && count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="store-mobile-nav"
            aria-label="Abrir o cerrar el menú"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="store-mobile-nav"
          aria-label="Principal (móvil)"
          className="border-t border-border px-4 py-2 md:hidden"
        >
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
