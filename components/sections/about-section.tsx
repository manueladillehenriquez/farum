import { BadgeCheck, Eye, Layers, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

// Traduce la clave `icon` de siteConfig.aboutSection.highlights a su ícono de lucide.
const HIGHLIGHT_ICONS: Record<
  (typeof siteConfig.aboutSection.highlights)[number]["icon"],
  LucideIcon
> = {
  exposure: Eye,
  google: BadgeCheck,
  tools: Layers,
};

export function AboutSection() {
  const { aboutSection } = siteConfig;

  return (
    <section
      id="quienes-somos"
      className="border-t border-border bg-card/40 py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {aboutSection.eyebrow}
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            {aboutSection.title}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {aboutSection.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {aboutSection.highlights.map((highlight) => {
            const Icon = HIGHLIGHT_ICONS[highlight.icon];
            return (
              <div
                key={highlight.title}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-instrument-serif text-xl text-foreground">
                  {highlight.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
