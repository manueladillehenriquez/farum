import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { TURNSTILE_SITE_KEY } from "@/lib/env";

export const metadata: Metadata = { title: "Ingresar" };

// Lee la site key de Turnstile del entorno en cada request.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="font-instrument-serif text-3xl text-foreground">Panel FARUM</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">Acceso restringido.</p>
      <div className="rounded-2xl border border-border bg-card p-6">
        <LoginForm siteKey={TURNSTILE_SITE_KEY} />
      </div>
    </main>
  );
}
