import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
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
        rotatingWords={siteConfig.hero.rotatingWords}
        rotatingInterval={siteConfig.hero.rotatingInterval}
        titleLine2={siteConfig.hero.titleLine2}
        description={siteConfig.hero.description}
        primaryButtonText={siteConfig.hero.primaryButtonText}
        secondaryButtonText={siteConfig.hero.secondaryButtonText}
      />
      <AboutSection />
      <ServicesSection />
      <ClientsSection />
      <WhyUsSection />
      <BookingSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
      <WhatsappFab />
      <SiteSignature />
    </main>
  );
}
