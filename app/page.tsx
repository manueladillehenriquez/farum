import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { ServicesSection } from "@/components/sections/services-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { BookingSection } from "@/components/sections/booking-section";
import { FaqSection } from "@/components/sections/faq-section";
import { ContactSection } from "@/components/sections/contact-section";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteSignature } from "@/components/site-signature";
import { siteConfig, waLink } from "@/lib/site-config";

export default function Home() {
  return (
    <main>
      <ResponsiveHeroBanner
        logoText={siteConfig.businessName}
        logoUrl={siteConfig.brand.logoHorizontal}
        ctaButtonHref={waLink()}
        badgeLabel={siteConfig.hero.badgeLabel}
        badgeText={siteConfig.hero.badgeText}
        title={siteConfig.hero.title}
        titleLine2={siteConfig.hero.titleLine2}
        description={siteConfig.hero.description}
        primaryButtonText={siteConfig.hero.primaryButtonText}
        secondaryButtonText={siteConfig.hero.secondaryButtonText}
        partnersTitle={siteConfig.hero.partnersTitle}
        partners={siteConfig.clients.map((c) => ({
          name: c.name,
          logoUrl: c.logo,
          href: c.url,
        }))}
      />
      <ServicesSection />
      <ClientsSection />
      <BookingSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
      <WhatsappFab />
      <SiteSignature />
    </main>
  );
}
