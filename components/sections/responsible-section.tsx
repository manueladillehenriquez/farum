import {
  BellOff,
  Briefcase,
  Lock,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";

// Traduce la clave `icon` de siteConfig.responsible.principles a su ícono de lucide.
const PRINCIPLE_ICONS: Record<
  (typeof siteConfig.responsible.principles)[number]["icon"],
  LucideIcon
> = {
  professional: Briefcase,
  clear: MessageSquareText,
  optout: BellOff,
  data: Lock,
};

export function ResponsibleSection() {
  const { responsible } = siteConfig;

  return (
    <section
      id="prospeccion-responsable"
      className="border-t border-border bg-background py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {responsible.eyebrow}
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            {responsible.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{responsible.description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {responsible.principles.map((principle) => {
            const Icon = PRINCIPLE_ICONS[principle.icon];
            return (
              <div
                key={principle.title}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-instrument-serif text-xl text-foreground">
                  {principle.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
