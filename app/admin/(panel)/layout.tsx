import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminButtonGhost } from "@/components/admin/ui";

const links = [
  { href: "/admin", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
];

// Todo el panel depende de la sesión: nunca se prerenderiza ni se cachea.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // El middleware ya filtró, pero la verificación real se repite acá.
  const { user } = await requireAdmin();

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-instrument-serif text-xl">FARUM · Panel</span>
            <nav aria-label="Panel" className="flex flex-wrap gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
            <form action={logoutAction}>
              <button type="submit" className={adminButtonGhost}>
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </>
  );
}
