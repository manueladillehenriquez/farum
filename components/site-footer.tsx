import Image from "next/image";
import { siteConfig, waLink } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-xs">
            <Image
              src={siteConfig.brand.logoVertical}
              alt={siteConfig.businessName}
              width={354}
              height={323}
              className="h-24 w-auto"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.tagline}: página web, QR llavero, tarjeta NFC y
              posicionamiento digital, todo en un solo kit.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Navegación
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="#servicios" className="text-muted-foreground hover:text-foreground">
                  Qué incluye
                </a>
                <a href="#clientes" className="text-muted-foreground hover:text-foreground">
                  Clientes
                </a>
                <a href="#agenda" className="text-muted-foreground hover:text-foreground">
                  Agendar
                </a>
                <a href="#faq" className="text-muted-foreground hover:text-foreground">
                  Preguntas frecuentes
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Contacto
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  WhatsApp
                </a>
                <span className="text-muted-foreground">
                  {siteConfig.address.street}, {siteConfig.address.comuna}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>
            © {year} {siteConfig.businessName} · Cumplimos Ley 21.719 de
            Protección de Datos Personales
          </span>
          <span>Hecho por {siteConfig.businessName}</span>
        </div>
      </div>
    </footer>
  );
}
