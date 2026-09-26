import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteSignature } from "@/components/site-signature";

/** Layout común de catálogo, carrito, checkout y confirmación de pedido. */
export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main id="contenido">{children}</main>
      <SiteFooter />
      <WhatsappFab />
      <SiteSignature />
    </>
  );
}
