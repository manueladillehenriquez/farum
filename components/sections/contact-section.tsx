"use client";

import { useEffect, useState } from "react";
import { siteConfig, waLink } from "@/lib/site-config";

export function ContactSection() {
  const { contactSection, address, hours, contactEmail } = siteConfig;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((mod) => {
      // `qrcode` es un paquete CommonJS; según cómo lo interprete el
      // bundler, el objeto real puede venir en `mod.default` o en `mod`.
      const QRCode = mod.default ?? mod;
      QRCode.toDataURL(
        waLink(siteConfig.whatsappMessages.qr),
        { width: 264, margin: 1, color: { dark: "#111318", light: "#ffffff" } }
      ).then((url) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="contacto" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="grid items-center gap-10 rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-10 md:grid-cols-[1fr_auto] md:text-left text-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              {contactSection.eyebrow}
            </p>
            <h3 className="mt-2 font-instrument-serif text-2xl text-foreground sm:text-3xl">
              {contactSection.title}
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              {contactSection.description}
            </p>
            <a
              href={waLink(siteConfig.whatsappMessages.meeting)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--whatsapp-dark)]"
            >
              {contactSection.buttonLabel}
            </a>
            <dl className="mt-6 flex flex-col gap-1 text-xs text-muted-foreground">
              <div>
                <dt className="sr-only">WhatsApp</dt>
                <dd>{siteConfig.whatsappNumberDisplay}</dd>
              </div>
              <div>
                <dt className="sr-only">Correo</dt>
                <dd>{contactEmail}</dd>
              </div>
              <div>
                <dt className="sr-only">Dirección</dt>
                <dd>
                  {address.street}, {address.comuna}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Horarios</dt>
                <dd>{hours.weekdays}</dd>
                <dd>{hours.saturday}</dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto flex flex-col items-center gap-2.5 rounded-2xl bg-white p-3.5 shadow-xl shadow-black/40">
            <div className="flex h-[132px] w-[132px] items-center justify-center">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data: URL generado en el cliente, next/image no lo optimiza igual
                <img src={qrDataUrl} alt="Código QR de WhatsApp" width={132} height={132} />
              ) : (
                <div className="h-full w-full animate-pulse rounded bg-neutral-200" />
              )}
            </div>
            <span className="text-xs font-bold text-neutral-900">
              {contactSection.qrCaption}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
