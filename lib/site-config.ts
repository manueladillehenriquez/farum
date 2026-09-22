/**
 * site-config.ts
 * ------------------------------------------------------------------
 * Toda la información del negocio (precios, WhatsApp, dirección,
 * horarios, clientes, mensajes) vive en un solo lugar. Los componentes
 * de /components/sections la importan desde acá — así, para actualizar
 * un precio o el número de WhatsApp solo se edita este archivo.
 * ------------------------------------------------------------------
 */

const BUSINESS_NAME = "FARUM";
// Precios (todos con IVA incluido). Se definen acá para usarlos igual en las
// cards, la FAQ y los mensajes, sin repetir el número a mano.
const INITIAL_PRICE = "$39.990"; // Paquete Inicial (pago único)
const ADVANCED_PRICE = "$59.990"; // Paquete Avanzado (pago único)
const FULL_PRO_PRICE = "$189.900"; // Paquete Full Pro = Avanzado + App (pago único)
const APP_PRICE = "$159.990"; // Desarrollo de la App contratado por separado
const MONTHLY_PRICE = "$9.990"; // Suscripción mensual: mantenimiento de la página
const MONTHLY_APP_PRICE = "$49.990"; // Suscripción mensual: página + App
const DOMAIN_TRANSFER_PRICE = "$19.990";

// Prefijo para las rutas de /public. Con el dominio propio (www.farum.cl)
// el sitio se sirve desde la raíz, así que queda vacío; se deja el
// mecanismo por si en algún momento vuelve a publicarse como repo de
// proyecto de GitHub Pages (https://usuario.github.io/<repo>/), donde
// `next/image` con `images.unoptimized` (requerido para el export
// estático) no agrega el prefijo solo.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteConfig = {
  businessName: BUSINESS_NAME,
  tagline: "Tu marca completa, lista para el siguiente nivel",
  description: `${BUSINESS_NAME} lleva tu empresa al siguiente nivel: página web con dominio, hosting e indexación en Google, tarjetas NFC, Google Ads y App. Para pymes en Santiago.`,

  // Logos (versión blanca para el tema oscuro). Los archivos viven en
  // /public/brand; ver el README para las variantes en negro.
  brand: {
    logoHorizontal: `${BASE_PATH}/brand/farum-logo-horizontal-white.png`,
    logoVertical: `${BASE_PATH}/brand/farum-logo-vertical-white.png`,
  },

  // Contenido del hero: se pasa como props a ResponsiveHeroBanner desde
  // app/page.tsx, para que todo el mensaje del sitio viva en un solo lugar.
  hero: {
    badgeLabel: "Nuevo",
    badgeText: "Tu marca completa, con entrega en 7 días",
    // Titular: "{title} {palabra rotativa} {titleLine2}". La palabra alterna
    // entre `rotatingWords` cada `rotatingInterval` ms (ver RotatingWord).
    title: "Tu",
    rotatingWords: ["empresa", "negocio", "pyme"],
    rotatingInterval: 1000,
    titleLine2: "al siguiente nivel.",
    description: "Obtén tu Paquete Inicial hoy y lleva tu tarjeta NFC de regalo",
    primaryButtonText: "Quiero mi Paquete Inicial",
    secondaryButtonText: "Ver qué incluye",
  },

  // Sección de servicios: encabezado y los 4 pilares del "siguiente nivel".
  // `icon` es una clave que components/sections/services-section.tsx
  // traduce al ícono de lucide correspondiente. `tags` son las etiquetas al
  // pie de la card: en qué paquetes va cada pieza (ver `pricing` más abajo).
  services: {
    eyebrow: "El siguiente nivel",
    title: "Todo lo que tu marca necesita para verse profesional",
    description:
      "Deja de armar tu presencia por partes. Reunimos lo esencial para que tu negocio se vea profesional, sea fácil de encontrar y esté siempre a un toque de tus clientes.",
    pillars: [
      {
        icon: "web",
        title: "Página web de tu marca",
        description:
          "Una página propia, con tu marca y tus datos, para que tus clientes te conozcan y te contacten.",
        tags: ["Incluida en todos los paquetes"],
      },
      {
        icon: "app",
        title: "Tu Propia APP",
        description:
          "Desarrollamos tu App y la dejamos lista para descargar por App Store o Play Store",
        tags: [
          "Incluida en el Paquete Full Pro",
          `Por separado: ${APP_PRICE} · IVA incluido`,
        ],
      },
      {
        icon: "nfc",
        title: "Tarjeta NFC",
        description:
          "Una tarjeta portable, de marketing (reseñas de Google o redes sociales) o de contacto. La acercas al celular de tu cliente y se abre sin instalar nada.",
        tags: [
          "De regalo en el Paquete Inicial",
          "2 tarjetas en el Avanzado y el Full Pro",
        ],
      },
      {
        icon: "seo",
        title: "Posicionamiento digital",
        description:
          "Indexamos tu página en Google para que tu negocio pueda aparecer en las búsquedas y, desde el Paquete Avanzado, sumamos una campaña de Google Ads.",
        tags: [
          "Indexación en todos los paquetes",
          "Google Ads en el Avanzado y el Full Pro",
        ],
      },
    ],
  },

  // WhatsApp (sin +, sin espacios, con código de país)
  whatsappNumber: "56979914514",
  whatsappNumberDisplay: "+56 9 7991 4514",
  whatsappDefaultMessage: `Hola ${BUSINESS_NAME}, quiero llevar mi negocio al siguiente nivel. ¿Me cuentan de los paquetes y la suscripción mensual?`,
  whatsappMessages: {
    quote: `Hola ${BUSINESS_NAME}, quiero cotizar uno de sus paquetes + la suscripción mensual.`,
    nextClient: `Hola ${BUSINESS_NAME}, quiero que mi negocio sea el próximo en llevar su marca al siguiente nivel.`,
    qr: `Hola ${BUSINESS_NAME}, vi el código QR y quiero más información.`,
  },

  contactEmail: "farum.cl@gmail.com",

  address: {
    street: "José Miguel Infante 1415",
    comuna: "Providencia",
    region: "Región Metropolitana",
    country: "CL",
  },

  hours: {
    weekdays: "Lunes a viernes: 11:00 a 15:00 hrs, presencial",
    saturday: "Sábado: 10:00 a 14:00 hrs, solo por videollamada Zoom",
  },

  pricing: {
    packagesTitle: "Elige tu paquete",
    packagesDescription: "Pago único, con IVA incluido.",
    // Paquete Inicial = Dominio + Hosting + Página web + Indexación, con una
    // tarjeta NFC de regalo (`gift`). Avanzado suma 2 tarjetas NFC y Google
    // Ads. Full Pro = Avanzado + desarrollo de la App.
    packages: [
      {
        name: "Paquete Inicial",
        price: INITIAL_PRICE,
        note: "pago único · IVA incluido",
        items: [
          "Dominio: la dirección de tu página en internet",
          "Hosting: el espacio donde vive tu página en internet",
          "Página web de tu marca: diseño y desarrollo",
          "Indexación en Google: tu página registrada para que Google la encuentre",
        ],
        gift: {
          title: "Tarjeta NFC de regalo",
          description:
            "De marketing (reseñas de Google o redes sociales) o de contacto",
        },
      },
      {
        name: "Paquete Avanzado",
        price: ADVANCED_PRICE,
        note: "pago único · IVA incluido",
        items: [
          "Dominio: la dirección de tu página en internet",
          "Hosting: el espacio donde vive tu página en internet",
          "Página web de tu marca: diseño y desarrollo",
          "Indexación en Google: tu página registrada para que Google la encuentre",
          "2 tarjetas NFC: Contacto y Conectividad",
          "Campaña de Google Ads: la inversión publicitaria la pagamos nosotros",
        ],
        gift: null,
      },
      {
        name: "Paquete Full Pro",
        price: FULL_PRO_PRICE,
        note: "pago único · IVA incluido",
        items: [
          "Dominio: la dirección de tu página en internet",
          "Hosting: el espacio donde vive tu página en internet",
          "Página web de tu marca: diseño y desarrollo",
          "Indexación en Google: tu página registrada para que Google la encuentre",
          "2 tarjetas NFC: Contacto y Conectividad",
          "Campaña de Google Ads: la inversión publicitaria la pagamos nosotros",
          "Desarrollo de tu App, lista para descargar en App Store y Play Store",
        ],
        gift: null,
      },
    ],

    subscriptionsTitle: "Suscripción mensual",
    subscriptionsDescription:
      "Después del lanzamiento, nos encargamos de mantener tu página, o tu página y tu App, al día.",
    subscriptions: [
      {
        name: "Suscripción mensual · Página",
        price: MONTHLY_PRICE,
        note: "/ mes · IVA incluido",
        items: [
          "Administración continua de tu sitio",
          "Actualizaciones de contenido ilimitadas",
          "Soporte y mantenimiento",
          "Requisitos de la Ley 21.719 al día",
        ],
        gift: null,
      },
      {
        name: "Suscripción mensual · Página + App",
        price: MONTHLY_APP_PRICE,
        note: "/ mes · IVA incluido",
        items: [
          "Todo lo de la suscripción mensual de tu página",
          "Mantenimiento de tu App",
        ],
        gift: null,
      },
    ],
    domainTransfer: DOMAIN_TRANSFER_PRICE,
  },

  // Sección "Nuestros clientes".
  clientsSection: {
    eyebrow: "Nuestros clientes",
    title: "Clientes que confían en nosotros",
    description: `Empresas, Pymes y Negocios que confían en ${BUSINESS_NAME}`,
  },

  // `displayUrl`: texto corto bajo el logo (sin https://). `logoBg`: color de
  // fondo del círculo; debe coincidir con el borde del logo para que no asome
  // ninguna línea (los logos con fondo transparente se suavizan en el borde).
  clients: [
    {
      name: "Inflables Champa",
      url: "https://www.inflableschampa.cl",
      displayUrl: "inflableschampa.cl",
      logo: `${BASE_PATH}/clients/inflables-champa.png`,
      logoBg: "#ffffff",
    },
    {
      name: "Zona Trofeos",
      url: "https://www.zonatrofeos.cl",
      displayUrl: "zonatrofeos.cl",
      logo: `${BASE_PATH}/clients/zona-trofeos.png`,
      logoBg: "#730728",
    },
    {
      name: "Nutricionista Camila Ortega",
      url: "https://manueladillehenriquez.github.io/nutricionista-camila-ortega/",
      displayUrl: "Ver sitio web",
      logo: `${BASE_PATH}/clients/nutricionista-camila-ortega.png`,
      logoBg: "#ffffff",
    },
  ],

  // Sección "¿Por qué elegirnos?": sellos de garantía bajo la de clientes.
  // `icon` es una clave que components/sections/why-us-section.tsx traduce
  // al ícono de lucide correspondiente (mismo patrón que `services.pillars`).
  whyUsSection: {
    eyebrow: "Garantías",
    title: "¿Por qué elegirnos?",
    description:
      "Trabajamos con reglas claras, de principio a fin: esto es lo que te garantizamos.",
    badges: [
      {
        icon: "payments",
        label: "Pagos 100% seguros",
      },
      {
        icon: "clients",
        label: "+10 clientes activos",
      },
      {
        icon: "invoice",
        label: "Boleta o factura",
      },
      {
        icon: "team",
        label: "Equipo de profesionales especializados",
      },
      {
        icon: "support",
        label: "Asistencia 24/7",
      },
    ],
  },

  faq: [
    {
      question: "¿Qué incluye cada paquete?",
      answer: `Todos son de pago único e incluyen IVA. Paquete Inicial (${INITIAL_PRICE}): dominio, hosting, página web e indexación en Google, con una tarjeta NFC de regalo. Paquete Avanzado (${ADVANCED_PRICE}): dominio, hosting, página web, indexación en Google, 2 tarjetas NFC (contacto y conectividad) y una campaña de Google Ads, cuya inversión publicitaria la pagamos nosotros. Paquete Full Pro (${FULL_PRO_PRICE}): todo lo del Avanzado, más el desarrollo de tu App.`,
    },
    {
      question: "¿Cómo puedo tener mi propia App?",
      answer: `La App viene incluida en el Paquete Full Pro (${FULL_PRO_PRICE}, IVA incluido), o puedes contratar su desarrollo por separado por ${APP_PRICE} (IVA incluido). La desarrollamos y la dejamos lista para descargar en App Store y Play Store.`,
    },
    {
      question: "¿Qué es la tarjeta NFC y cómo se usa?",
      answer:
        "Es una tarjeta con un chip NFC. Tu cliente la acerca a la parte trasera de su celular (los teléfonos modernos lo permiten) y se abre lo que dejamos configurado, sin instalar nada. Puede ser de marketing, para llevar a tus clientes a dejar una reseña en Google o a tus redes sociales, o de contacto, para compartir tus datos. El Paquete Inicial incluye una de regalo; el Avanzado y el Full Pro incluyen dos (contacto y conectividad).",
    },
    {
      question: "¿Qué es la indexación en Google?",
      answer:
        "Es registrar tu página para que Google la conozca y pueda mostrarla cuando alguien busca lo que ofreces. Todos los paquetes la incluyen; el Avanzado y el Full Pro suman además una campaña de Google Ads. No prometemos un puesto exacto en los resultados, porque nadie puede, pero sí dejamos tu presencia bien construida para que compitas de verdad.",
    },
    {
      question: "¿Cuánto demora la entrega?",
      answer:
        "Tu página, una semana desde que definimos los detalles en la reunión inicial. El desarrollo de la App tiene su propio plazo, que definimos contigo.",
    },
    {
      question: "¿Qué pasa si cancelo la suscripción?",
      answer:
        "Se da de baja tu página, sin costo ni letra chica. Vuelves cuando quieras.",
    },
    {
      question: "¿Cuántas actualizaciones de contenido incluye el mes?",
      answer:
        "Ilimitadas en tu página: cambias precios, fotos, textos o promociones las veces que necesites.",
    },
    {
      question: "¿El dominio queda a mi nombre?",
      answer: `Por defecto no, para poder administrarlo sin trabas mientras estás en la suscripción. Si en algún momento lo quieres 100% a tu nombre, es una opción disponible por ${DOMAIN_TRANSFER_PRICE}.`,
    },
    {
      question: "¿Cuántos paquetes y suscripciones hay?",
      answer: `Hay tres paquetes (Inicial, Avanzado y Full Pro) y dos suscripciones mensuales: mantenimiento de tu página (${MONTHLY_PRICE}) o de tu página y tu App (${MONTHLY_APP_PRICE}), ambas con IVA incluido. Si tu negocio necesita algo más específico, escríbenos y lo vemos juntos.`,
    },
    {
      question: "¿Por qué no lo hago yo mismo en Wix o Canva?",
      answer: `Puedes, pero te va a tomar tiempo que no tienes, y sin SEO técnico igual no te va a encontrar nadie en Google. Con ${BUSINESS_NAME} recibes dominio, hosting, tu página web e indexación en Google, y si quieres más, sumas tarjetas NFC, Google Ads o tu propia App. Tú te dedicas a tu negocio.`,
    },
    {
      question: "¿Con quién voy a hablar?",
      answer:
        "Directo con nosotros por WhatsApp. No hay call center ni tickets de soporte: te respondemos el mismo día.",
    },
  ],
} as const;

/** Construye un link de WhatsApp (wa.me) con mensaje precargado. */
export function waLink(message: string = siteConfig.whatsappDefaultMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
