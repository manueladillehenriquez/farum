import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { TURNSTILE_SITE_KEY } from "@/lib/env";
import { isWebpaySandbox } from "@/lib/server/webpay";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false, follow: false },
};

// Lee variables de entorno en cada request (aviso de sandbox, site key).
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const { checkout } = siteConfig;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-instrument-serif text-4xl text-foreground sm:text-5xl">
        {checkout.title}
      </h1>
      <p className="mb-10 mt-3 max-w-2xl text-muted-foreground">{checkout.description}</p>
      <CheckoutForm siteKey={TURNSTILE_SITE_KEY} sandbox={isWebpaySandbox()} />
    </div>
  );
}
