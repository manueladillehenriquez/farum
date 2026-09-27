import { siteConfig, waLink } from "@/lib/site-config";

/** Se muestra si Supabase no está configurado o no responde. */
export function CatalogUnavailable() {
  const { catalog } = siteConfig;
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <h2 className="font-instrument-serif text-2xl text-foreground">
        {catalog.unavailableTitle}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">{catalog.unavailableDescription}</p>
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--whatsapp-dark)]"
      >
        Escríbenos por WhatsApp
      </a>
    </div>
  );
}
