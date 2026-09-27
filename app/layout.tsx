import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { SITE_URL } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter-font",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--instrument-serif-font",
  display: "swap",
});

// Solo para la palabra rotativa del hero (ver RotatingWord): una
// geométrica y de trazo firme, bien distinta de la serif del titular y
// de la sans del resto del texto, para que la palabra destaque.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--space-grotesk-font",
  display: "swap",
});

// URL canónica del sitio (NEXT_PUBLIC_SITE_URL; por defecto https://www.farum.cl).
const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.businessName} — Página web y tarjeta NFC para pymes en Santiago`,
    template: `%s · ${siteConfig.businessName}`,
  },
  description: siteConfig.description,
  keywords: [
    "posicionamiento digital",
    "página web para pymes",
    "dominio y hosting",
    "indexación en Google",
    "campaña Google Ads",
    "desarrollo de App",
    "tarjeta NFC",
    "tarjeta NFC reseñas Google",
    "SEO local Chile",
    "diseño web para pymes Santiago",
    "profesionalizar marca",
    "administración mensual de sitio web",
    "Providencia Santiago",
  ],
  authors: [{ name: siteConfig.businessName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    title: `${siteConfig.businessName} — Tu empresa al siguiente nivel`,
    description: siteConfig.description,
    siteName: siteConfig.businessName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.businessName} — Tu empresa al siguiente nivel`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.businessName,
  description: siteConfig.description,
  url: siteUrl,
  logo: `${siteUrl}/brand/farum-logo-vertical-black.png`,
  telephone: `+${siteConfig.whatsappNumber}`,
  email: siteConfig.contactEmail,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.comuna,
    addressRegion: siteConfig.address.region,
    addressCountry: siteConfig.address.country,
  },
  areaServed: "CL",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "11:00",
      closes: "15:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
