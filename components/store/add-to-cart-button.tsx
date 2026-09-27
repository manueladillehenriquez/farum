"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useCart, type CartProductInput } from "@/components/cart/cart-provider";

export function AddToCartButton({ product }: { product: CartProductInput }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(t);
  }, [justAdded]);

  return (
    <button
      type="button"
      onClick={() => {
        add(product, 1);
        setJustAdded(true);
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" />
          {siteConfig.catalog.added}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {siteConfig.catalog.addToCart}
        </>
      )}
      <span aria-live="polite" className="sr-only">
        {justAdded ? `${product.nombre} agregado al carrito` : ""}
      </span>
    </button>
  );
}
