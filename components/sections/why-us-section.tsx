import {
  Headset,
  Landmark,
  ReceiptText,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { GuaranteeSeal } from "@/components/ui/guarantee-seal";
import { siteConfig } from "@/lib/site-config";

// Traduce la clave `icon` de siteConfig.whyUsSection.badges a su ícono de
// lucide (mismo patrón que PILLAR_ICONS en services-section.tsx).
const BADGE_ICONS: Record<
  (typeof siteConfig.whyUsSection.badges)[number]["icon"],
  LucideIcon
> = {
  payments: Landmark,
  clients: UsersRound,
  invoice: ReceiptText,
  team: UserCog,
  support: Headset,
};

export function WhyUsSection() {
  const { whyUsSection } = siteConfig;

  return (
    <section className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {whyUsSection.eyebrow}
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            {whyUsSection.title}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {whyUsSection.description}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {whyUsSection.badges.map((badge) => {
            const Icon = BADGE_ICONS[badge.icon];
            return (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-3 text-center"
              >
                <GuaranteeSeal>
                  <Icon className="h-7 w-7" />
                </GuaranteeSeal>
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
