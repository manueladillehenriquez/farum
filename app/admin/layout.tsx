import type { Metadata } from "next";

// El panel nunca debe aparecer en buscadores.
export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel FARUM" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
