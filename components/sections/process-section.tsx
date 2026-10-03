import { siteConfig } from "@/lib/site-config";

export function ProcessSection() {
  const { process } = siteConfig;

  return (
    <section
      id="como-trabajamos"
      className="border-t border-border bg-card/40 py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {process.eyebrow}
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            {process.title}
          </h2>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 font-space-grotesk text-lg font-bold text-accent">
                {index + 1}
              </span>
              <h3 className="font-instrument-serif text-xl text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
