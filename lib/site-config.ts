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
const DOMAIN_TRANSFER_PRICE = "$19.990";

// Cuando el sitio se publica en GitHub Pages como repo de proyecto
// (https://usuario.github.io/<repo>/), las imágenes de /public
// necesitan este prefijo — `next/image` con `images.unoptimized`
// (requerido para el export estático) NO lo agrega solo. El workflow
// de GitHub Actions (.github/workflows/deploy.yml) define esta
// variable al buildear; en local o en un hosting con dominio propio
// queda vacía y las rutas se sirven desde la raíz, como siempre.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteConfig = {
  businessName: BUSINESS_NAME,
  tagline: "Tu marca completa, lista para el siguiente nivel",
  description: `${BUSINESS_NAME} lleva tu empresa al siguiente nivel: página web, QR llavero, tarjeta NFC y posicionamiento en Google en un solo kit para pymes en Santiago.`,

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
    title: "Lleva tu empresa",
    titleLine2: "al siguiente nivel.",
    description:
      "Página web, QR llavero, tarjeta NFC y posicionamiento en Google: todo lo que tu marca necesita para verse y ser profesional, en un solo kit y sin que armes nada por tu cuenta.",
    primaryButtonText: "Quiero mi kit",
    secondaryButtonText: "Ver qué incluye",
    partnersTitle: `Negocios que ya confían en ${BUSINESS_NAME}`,
  },

  // Sección de servicios: encabezado y los 4 pilares del "siguiente nivel".
  // `icon` es una clave que components/sections/services-section.tsx
  // traduce al ícono de lucide correspondiente.
  services: {
    eyebrow: "El siguiente nivel",
    title: "Todo lo que tu marca necesita para verse profesional, en un solo kit",
    description:
      "Deja de armar tu presencia por partes. Reunimos lo esencial para que tu negocio se vea profesional, sea fácil de encontrar y esté siempre a un toque de tus clientes.",
    pillars: [
      {
        icon: "web",
        title: "Página web de tu marca",
        description:
          "Una página propia, con tu marca y tus datos, para que tus clientes te conozcan y te contacten.",
      },
      {
        icon: "qr",
        title: "QR llavero",
        description:
          "Un llavero con código QR que lleva directo a tu página. Lo entregas en mano o lo dejas a la vista: tu cliente escanea y llega.",
      },
      {
        icon: "nfc",
        title: "Tarjeta NFC",
        description:
          "Una tarjeta portable, de contacto o de marketing. La acercas al celular de tu cliente y se abre tu página, tu contacto o tu link de reseñas.",
      },
      {
        icon: "seo",
        title: "Posicionamiento digital",
        description:
          "Activamos y optimizamos tu SEO local para que tu negocio aparezca en Google cuando te buscan cerca.",
      },
    ],
  },

  // WhatsApp (sin +, sin espacios, con código de país)
  whatsappNumber: "56979914514",
  whatsappNumberDisplay: "+56 9 7991 4514",
  whatsappDefaultMessage: `Hola ${BUSINESS_NAME}, quiero llevar mi negocio al siguiente nivel. ¿Me cuentan del Kit de Lanzamiento y el Plan de Mantención?`,
  whatsappMessages: {
    quote: `Hola ${BUSINESS_NAME}, quiero cotizar el Kit de Lanzamiento + Plan de Mantención.`,
    nextClient: `Hola ${BUSINESS_NAME}, quiero que mi negocio sea el próximo en llevar su marca al siguiente nivel.`,
    qr: `Hola ${BUSINESS_NAME}, vi el código QR y quiero más información.`,
  },

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
    launch: {
      name: "Kit de Lanzamiento",
      price: "$69.990",
      note: "pago único · IVA incluido",
      items: [
        "Página web de tu marca: diseño y desarrollo",
        "Posicionamiento digital: activación y optimización de SEO local en Google",
        "Llavero con código QR que lleva a tu página",
        "Tarjeta NFC portable (contacto o marketing), también para reseñas en Google",
        "1.000 flyers personalizados",
        "100 tarjetas de presentación personalizadas",
      ],
    },
    monthly: {
      name: "Plan de Mantención",
      price: "$9.990",
      note: "/ mes · IVA incluido",
      items: [
        "Administración continua de tu sitio",
        "Actualizaciones de contenido ilimitadas",
        "Soporte y mantenimiento",
        "Requisitos de la Ley 21.719 al día",
      ],
    },
    domainTransfer: DOMAIN_TRANSFER_PRICE,
  },

  clients: [
    {
      name: "Inflables Champa",
      url: "https://www.inflableschampa.cl",
      logo: `${BASE_PATH}/clients/inflables-champa.png`,
    },
    {
      name: "Zona Trofeos",
      url: "https://www.zonatrofeos.cl",
      logo: `${BASE_PATH}/clients/zona-trofeos.png`,
    },
  ],

  faq: [
    {
      question: "¿Qué incluye el Kit de Lanzamiento?",
      answer:
        "Cuatro piezas que trabajan juntas: la página web de tu marca, un llavero con código QR que lleva a ella, una tarjeta NFC portable y el posicionamiento digital de tu negocio en Google (SEO local). Además incluye 1.000 flyers y 100 tarjetas de presentación personalizadas.",
    },
    {
      question: "¿Qué es el QR llavero y cómo se usa?",
      answer:
        "Es un llavero con un código QR que abre tu página. Lo llevas contigo: tu cliente apunta la cámara de su celular al código y entra directo, sin buscarte ni escribir nada. Sirve para entregarlo en mano o dejarlo a la vista en tu local.",
    },
    {
      question: "¿Qué es la tarjeta NFC y cómo se usa?",
      answer:
        "Es una tarjeta con un chip NFC. Tu cliente la acerca a la parte trasera de su celular (los teléfonos modernos lo permiten) y se abre tu página, tu contacto o tu link de reseñas en Google, sin instalar nada. Puede ser de contacto o de marketing, según lo que necesites.",
    },
    {
      question: "¿Qué es el posicionamiento digital?",
      answer:
        "Es dejar tu negocio bien configurado y optimizado para que Google lo muestre cuando alguien busca lo que ofreces cerca de ti (SEO local). No prometemos un puesto exacto en Google, porque nadie puede, pero sí dejamos tu presencia bien construida para que compitas de verdad.",
    },
    {
      question: "¿Cuánto demora la entrega?",
      answer: "Una semana desde que definimos los detalles en la reunión inicial.",
    },
    {
      question: "¿Qué pasa si cancelo la suscripción?",
      answer:
        "Se da de baja tu página, sin costo ni letra chica. Vuelves cuando quieras.",
    },
    {
      question: "¿Cuántas actualizaciones de contenido incluye el mes?",
      answer:
        "Ilimitadas: cambias precios, fotos, textos o promociones las veces que necesites.",
    },
    {
      question: "¿El dominio queda a mi nombre?",
      answer: `Por defecto no, para poder administrarlo sin trabas mientras estás en la suscripción. Si en algún momento lo quieres 100% a tu nombre, es una opción disponible por ${DOMAIN_TRANSFER_PRICE}.`,
    },
    {
      question: "¿Hay planes más grandes o más chicos?",
      answer:
        "Por ahora manejamos un solo Kit de Lanzamiento y un solo Plan de Mantención, simple a propósito. Si tu negocio necesita algo más específico, escríbenos y lo vemos juntos.",
    },
    {
      question: "¿Por qué no lo hago yo mismo en Wix o Canva?",
      answer: `Puedes, pero te va a tomar tiempo que no tienes, y sin SEO técnico igual no te va a encontrar nadie en Google. Con ${BUSINESS_NAME} recibes todo resuelto y conectado: tu página, el llavero QR y la tarjeta NFC apuntando a ella, y el posicionamiento activado. Tú te dedicas a tu negocio.`,
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
