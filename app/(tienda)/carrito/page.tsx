import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tu carrito",
  robots: { index: false, follow: false },
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const { pago } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-10 font-instrument-serif text-4xl text-foreground sm:text-5xl">
        {siteConfig.cart.title}
      </h1>
      <CartView paymentError={pago === "error"} />
    </div>
  );
}
