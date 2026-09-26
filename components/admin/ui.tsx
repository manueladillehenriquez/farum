import type { ReactNode } from "react";

export const adminInput =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const adminButton =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60";

export const adminButtonGhost =
  "inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent";

/** Campo con etiqueta, ayuda y mensaje de error accesibles. */
export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-yellow-500/15 text-yellow-300 ring-yellow-500/30",
  pagado: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  despachado: "bg-green-500/15 text-green-300 ring-green-500/30",
  fallido: "bg-red-500/15 text-red-300 ring-red-500/30",
};

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${
        ESTADO_STYLES[estado] ?? "bg-card text-muted-foreground ring-border"
      }`}
    >
      {estado}
    </span>
  );
}
