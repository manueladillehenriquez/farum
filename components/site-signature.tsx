import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

/**
 * Pequeño sello de autoría, fijo en la esquina inferior derecha en todas
 * las secciones (igual que el botón de WhatsApp, pero más arriba para no
 * pisarlo). Es el logo horizontal de {businessName}, sutil y semitransparente:
 * funciona como garantía visual de que el sitio es realmente de la marca,
 * reforzando el aviso antifraude de la sección de contacto.
 */
export function SiteSignature() {
  return (
    <a
      href="#inicio"
      aria-label={`${siteConfig.businessName} — sitio oficial`}
      className="fixed bottom-24 right-5 z-40 opacity-40 transition-opacity hover:opacity-80"
    >
      <Image
        src={siteConfig.brand.logoHorizontal}
        alt={siteConfig.businessName}
        width={592}
        height={146}
        className="h-5 w-auto"
      />
    </a>
  );
}
