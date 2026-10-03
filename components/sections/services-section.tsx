import {
  CalendarCheck,
  Check,
  Globe,
  Smartphone,
  Target,
  type LucideIcon,
} from "lucide-react";
import { siteConfig, waLink } from "@/lib/site-config";

// Traduce la clave `icon` de siteConfig.services.pillars a su ícono de lucide.
const PILLAR_ICONS: Record<
  (typeof siteConfig.services.pillars)[number]["icon"],
  LucideIcon
> = {
  prospect: Target,
  schedule: CalendarCheck,
  presence: Globe,
  software: Smartphone,
};

function ServiceCard({
  pillar,
  quoteLabel,
}: {
  pillar: (typeof siteConfig.services.pillars)[number];
  quoteLabel: string;
}) {
  const Icon = PILLAR_ICONS[pillar.icon];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-instrument-serif text-xl text-foreground">
        {pillar.title}
      </h3>
      <p className="text-sm text-muted-foreground">{pillar.description}</p>
      <ul className="flex flex-col gap-2">
        {pillar.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <a
        href={waLink(pillar.quoteMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center rounded-full bg-[var(--whatsapp)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--whatsapp-dark)]"
      >
        {quoteLabel}
      </a>
    </div>
  );
}

export function ServicesSection() {
  const { services } = siteConfig;

  return (
    <section id="servicios" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {services.eyebrow}
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            {services.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{services.description}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.pillars.map((pillar) => (
            <ServiceCard
              key={pillar.title}
              pillar={pillar}
              quoteLabel={services.quoteLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
