import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
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

// TODO: cuando conectes un dominio propio a GitHub Pages, reemplaza esta
// URL por la real (y actualiza también app/sitemap.ts y app/robots.ts).
const siteUrl = "https://manueladillehenriquez.github.io/farum";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.businessName} — Web, QR, NFC y SEO local para pymes en Santiago`,
    template: `%s · ${siteConfig.businessName}`,
  },
  description: siteConfig.description,
  keywords: [
    "posicionamiento digital",
    "página web para pymes",
    "llavero código QR",
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
    title: `${siteConfig.businessName} — Lleva tu empresa al siguiente nivel`,
    description: siteConfig.description,
    siteName: siteConfig.businessName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.businessName} — Lleva tu empresa al siguiente nivel`,
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
      className={`${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
