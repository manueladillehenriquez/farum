import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { ResponsibleSection } from "@/components/sections/responsible-section";
import { FaqSection } from "@/components/sections/faq-section";
import { ContactSection } from "@/components/sections/contact-section";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteSignature } from "@/components/site-signature";
import { siteConfig, waLink } from "@/lib/site-config";

export default function Home() {
  const meetingLink = waLink(siteConfig.whatsappMessages.meeting);

  return (
    <main>
      <ResponsiveHeroBanner
        logoText={siteConfig.businessName}
        logoUrl={siteConfig.brand.logoHorizontal}
        navLinks={[...siteConfig.nav]}
        ctaButtonText={siteConfig.ctaLabel}
        ctaButtonHref={meetingLink}
        badgeLabel={siteConfig.hero.badgeLabel}
        badgeText={siteConfig.hero.badgeText}
        title={siteConfig.hero.title}
        rotatingWords={siteConfig.hero.rotatingWords}
        rotatingInterval={siteConfig.hero.rotatingInterval}
        titleLine2={siteConfig.hero.titleLine2}
        description={siteConfig.hero.description}
        primaryButtonText={siteConfig.hero.primaryButtonText}
        primaryButtonHref={meetingLink}
        secondaryButtonText={siteConfig.hero.secondaryButtonText}
      />
      <AboutSection />
      <ServicesSection />
      <ProcessSection />
      <ClientsSection />
      <WhyUsSection />
      <ResponsibleSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
      <WhatsappFab />
      <SiteSignature />
    </main>
  );
}
