import {
  Check,
  Gift,
  Globe,
  Nfc,
  Search,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { siteConfig, waLink } from "@/lib/site-config";

// Traduce la clave `icon` de siteConfig.services.pillars a su ícono de lucide.
const PILLAR_ICONS: Record<
  (typeof siteConfig.services.pillars)[number]["icon"],
  LucideIcon
> = {
  web: Globe,
  app: Smartphone,
  nfc: Nfc,
  seo: Search,
};

type Plan =
  | (typeof siteConfig.pricing.packages)[number]
  | (typeof siteConfig.pricing.subscriptions)[number];

function PillarCard({
  pillar,
}: {
  pillar: (typeof siteConfig.services.pillars)[number];
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
      {pillar.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2">
          {pillar.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-border px-3 py-1 text-xs font-medium leading-snug text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceCard({ plan }: { plan: Plan }) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8">
      <h3 className="font-instrument-serif text-2xl text-foreground">
        {plan.name}
      </h3>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {plan.price}
        </span>
        <span className="text-sm text-muted-foreground">{plan.note}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {plan.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {plan.gift && (
        <div className="mt-auto flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <Gift className="mt-0.5 h-5 w-5 flex-none text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {plan.gift.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {plan.gift.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div className="mt-16">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <h3 className="font-instrument-serif text-2xl text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

export function ServicesSection() {
  const { services, pricing } = siteConfig;

  return (
    <section id="servicios" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {services.eyebrow}
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            {services.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{services.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.pillars.map((pillar) => (
            <PillarCard key={pillar.title} pillar={pillar} />
          ))}
        </div>

        <PricingGroup
          title={pricing.packagesTitle}
          description={pricing.packagesDescription}
          className="grid gap-6 lg:grid-cols-3"
        >
          {pricing.packages.map((plan) => (
            <PriceCard key={plan.name} plan={plan} />
          ))}
        </PricingGroup>

        <PricingGroup
          title={pricing.subscriptionsTitle}
          description={pricing.subscriptionsDescription}
          className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2"
        >
          {pricing.subscriptions.map((plan) => (
            <PriceCard key={plan.name} plan={plan} />
          ))}
        </PricingGroup>

        <div className="mt-10 text-center">
          <a
            href={waLink(siteConfig.whatsappMessages.quote)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-[var(--whatsapp-dark)]"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
