import {
  CalendarCheck,
  Check,
  Globe,
  Minus,
  Smartphone,
  Target,
  type LucideIcon,
} from "lucide-react";
import { siteConfig, waLink } from "@/lib/site-config";

type Pillar = (typeof siteConfig.services.pillars)[number];

// Traduce la clave `icon` de siteConfig.services.pillars a su ícono de lucide.
const PILLAR_ICONS: Record<Pillar["icon"], LucideIcon> = {
  prospect: Target,
  presence: Globe,
  software: Smartphone,
};

function ServiceCard({
  pillar,
  quoteLabel,
}: {
  pillar: Pillar;
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

      {pillar.items.length > 0 && (
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
      )}

      {pillar.modules.length > 0 && (
        <ul className="flex flex-col gap-3">
          {pillar.modules.map((module) => (
            <li
              key={module.name}
              className="flex items-start justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {module.name}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {module.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

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

function GoogleAdsPlans() {
  const ads = siteConfig.googleAds;
  return (
    <div id="google-ads" className="mt-16 scroll-mt-24">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {ads.eyebrow}
        </p>
        <h3 className="mt-3 font-instrument-serif text-2xl text-foreground sm:text-3xl">
          {ads.title}
        </h3>
        <p className="mt-3 text-muted-foreground">{ads.description}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="p-4 text-left font-normal">
                <span className="sr-only">Qué incluye</span>
              </th>
              {ads.plans.map((plan) => (
                <th
                  key={plan}
                  scope="col"
                  className="p-4 text-center font-medium text-foreground"
                >
                  {plan}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ads.features.map((feature) => (
              <tr key={feature.label} className="border-b border-border">
                <th
                  scope="row"
                  className="p-4 text-left font-normal text-muted-foreground"
                >
                  {feature.label}
                </th>
                {ads.plans.map((plan, index) => {
                  const included = index + 1 >= feature.includedFrom;
                  return (
                    <td key={plan} className="p-4 text-center">
                      {included ? (
                        <Check
                          className="mx-auto h-4 w-4 text-accent"
                          aria-label="Incluido"
                        />
                      ) : (
                        <Minus
                          className="mx-auto h-4 w-4 text-muted-foreground/50"
                          aria-label="No incluido"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="p-4" />
              {ads.plans.map((plan) => (
                <td key={plan} className="p-4 text-center">
                  <a
                    href={waLink(ads.quoteMessage(plan))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--whatsapp)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--whatsapp-dark)]"
                  >
                    {ads.quoteLabel}
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {ads.note}
      </p>
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

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.pillars.map((pillar) => (
            <ServiceCard
              key={pillar.title}
              pillar={pillar}
              quoteLabel={services.quoteLabel}
            />
          ))}
        </div>

        <GoogleAdsPlans />
      </div>
    </section>
  );
}
