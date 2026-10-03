/**
 * site-config.ts
 * ------------------------------------------------------------------
 * Toda la información del negocio (servicios, WhatsApp, dirección,
 * horarios, mensajes) vive en un solo lugar. Los componentes
 * de /components/sections la importan desde acá — así, para actualizar
 * un texto o el número de WhatsApp solo se edita este archivo.
 *
 * Giro vigente: servicios para empresas por suscripción mensual,
 * presupuestados a medida en una reunión. No hay paquetes ni precios
 * públicos: no los agregues acá.
 * ------------------------------------------------------------------
 */

const BUSINESS_NAME = "FARUM";

// Prefijo para las rutas de /public. Con el dominio propio (www.farum.cl)
// el sitio se sirve desde la raíz, así que queda vacío; se deja el
// mecanismo por si en algún momento vuelve a publicarse como repo de
// proyecto de GitHub Pages (https://usuario.github.io/<repo>/), donde
// `next/image` con `images.unoptimized` (requerido para el export
// estático) no agrega el prefijo solo.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MEETING_MESSAGE = `Hola ${BUSINESS_NAME}, quiero agendar una reunión para conocer sus servicios.`;

export const siteConfig = {
  businessName: BUSINESS_NAME,
  tagline: "Prospección, presencia digital y software para tu empresa",
  description: `${BUSINESS_NAME} reúne prospección de clientes, agendamiento de reuniones, presencia digital (página web, indexación en Google, Google Ads y posicionamiento SEO) y desarrollo de software y apps, para empresas y pymes de Chile.`,

  // Logos (versión blanca para el tema oscuro). Los archivos viven en
  // /public/brand; ver el README para las variantes en negro.
  brand: {
    logoHorizontal: `${BASE_PATH}/brand/farum-logo-horizontal-white.png`,
    logoVertical: `${BASE_PATH}/brand/farum-logo-vertical-white.png`,
  },

  // Navegación del header (y del menú móvil). `href` apunta a las anclas
  // de las secciones de app/page.tsx.
  nav: [
    { label: "Servicios", href: "#servicios" },
    { label: "Cómo trabajamos", href: "#como-trabajamos" },
    { label: "Clientes", href: "#clientes" },
    { label: "Preguntas", href: "#faq" },
  ],
  ctaLabel: "Agenda tu reunión",

  // Contenido del hero: se pasa como props a ResponsiveHeroBanner desde
  // app/page.tsx, para que todo el mensaje del sitio viva en un solo lugar.
  hero: {
    badgeLabel: "Cupos limitados",
    badgeText: "Un grupo reducido de clientes, con trato directo de los socios",
    // Titular: "{title} {palabra rotativa} {titleLine2}". La palabra alterna
    // entre `rotatingWords` cada `rotatingInterval` ms (ver RotatingWord).
    title: "Encontramos clientes para tu",
    rotatingWords: ["empresa", "negocio", "pyme"],
    rotatingInterval: 1000,
    titleLine2: "y hacemos que te encuentren.",
    description:
      "Prospección, agendamiento de reuniones, presencia digital y desarrollo de software, en un solo equipo y con una suscripción mensual a tu medida.",
    primaryButtonText: "Agenda tu reunión",
    secondaryButtonText: "Ver servicios",
  },

  // Sección "Quiénes somos". `icon` es una clave que
  // components/sections/about-section.tsx traduce a un ícono de lucide
  // (mismo patrón que `services.pillars`).
  aboutSection: {
    eyebrow: "Quiénes somos",
    title: "Un solo equipo para llegar a tus clientes y hacer que te encuentren",
    description: `${BUSINESS_NAME} reúne a dos socios con roles distintos y complementarios: uno sale a buscar a tus próximos clientes y el otro construye tu presencia digital. Trabajamos con empresas y pymes de Chile, de forma directa y sin intermediarios.`,
    highlights: [
      {
        icon: "reach",
        title: "Llegamos a tus próximos clientes",
        description:
          "Prospectamos por llamadas, correo y LinkedIn a empresas segmentadas según tu mercado, y agendamos y confirmamos las reuniones por ti.",
      },
      {
        icon: "found",
        title: "Hacemos que te encuentren",
        description:
          "Tu página, tu indexación en Google, tus campañas de Google Ads y tu posicionamiento en buscadores y en IA, con una estrategia de búsqueda constante.",
      },
      {
        icon: "build",
        title: "Construimos lo que necesitas",
        description:
          "Software y apps a medida, y herramientas de integración digital como las tarjetas NFC, para que todo trabaje junto.",
      },
    ],
  },

  // Sección de servicios: encabezado y las 4 líneas de servicio. `icon` es una
  // clave que components/sections/services-section.tsx traduce al ícono de
  // lucide. `quoteMessage` es el mensaje de WhatsApp del botón "Cotizar".
  services: {
    eyebrow: "Servicios",
    title: "Contrata solo lo que tu empresa necesita",
    description:
      "Armamos tu suscripción mensual a medida: en la reunión definimos qué servicios necesitas y el presupuesto sale según los que tomes.",
    quoteLabel: "Cotizar este servicio",
    pillars: [
      {
        icon: "prospect",
        title: "Prospección de clientes",
        description: "Salimos a buscar a tus próximos clientes.",
        items: [
          "Llamadas, correo y LinkedIn",
          "Segmentación según tu mercado",
          "Mensajes personalizados",
        ],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el servicio de prospección de clientes.`,
      },
      {
        icon: "schedule",
        title: "Agendamiento y confirmaciones",
        description:
          "Coordinamos las reuniones con los interesados y las confirmamos antes de que ocurran.",
        items: [
          "Agendamiento con los interesados",
          "Confirmación previa de cada reunión",
          "Gestión directa de los socios",
        ],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el servicio de agendamiento y confirmación de reuniones.`,
      },
      {
        icon: "presence",
        title: "Presencia digital",
        description: "Que tu marca se vea, exista y se encuentre.",
        items: [
          "Página web, dominio y hosting",
          "Indexación en Google",
          "Campañas de Google Ads",
          "Posicionamiento SEO y en IA",
          "Herramientas de integración digital, como tarjetas NFC",
        ],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el servicio de presencia digital.`,
      },
      {
        icon: "software",
        title: "Software y apps",
        description:
          "Desarrollamos la herramienta que tu negocio necesita y la dejamos funcionando.",
        items: ["Apps móviles", "Software a medida", "Páginas web"],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el desarrollo de software o de una app.`,
      },
    ],
  },

  // Sección "Cómo trabajamos": pasos desde el primer contacto.
  process: {
    eyebrow: "Cómo trabajamos",
    title: "De la primera reunión a tu servicio funcionando",
    steps: [
      {
        title: "Reunión con ambos socios",
        description:
          "Conversamos sobre tu negocio, tus clientes ideales y lo que necesitas.",
      },
      {
        title: "Presupuesto a medida",
        description:
          "Armamos tu suscripción mensual solo con los servicios que tomes.",
      },
      {
        title: "Puesta en marcha",
        description: "Configuramos, lanzamos y empezamos a trabajar contigo.",
      },
      {
        title: "Seguimiento constante",
        description:
          "Ajustamos la estrategia mes a mes: es una búsqueda constante, no un trabajo de una sola vez.",
      },
    ],
  },

  // Sección "Nuestros clientes".
  clientsSection: {
    eyebrow: "Nuestros clientes",
    title: "Empresas que ya confían en nosotros",
    description: `Negocios con los que hemos trabajado en su presencia digital.`,
  },

  // `displayUrl`: texto corto bajo el logo (sin https://). `logoBg`: color de
  // fondo del círculo; debe coincidir con el borde del logo para que no asome
  // ninguna línea (los logos con fondo transparente se suavizan en el borde).
  // Se irán sumando más clientes: agrega el logo a /public/clients.
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
      url: "https://www.nutricionistacamilaortega.cl",
      displayUrl: "www.nutricionistacamilaortega.cl",
      logo: `${BASE_PATH}/clients/nutricionista-camila-ortega.png`,
      logoBg: "#ffffff",
    },
  ],

  // Sección "Por qué FARUM": solo sellos que sean verdad. No agregues cifras
  // ni garantías (clientes activos, asistencia 24/7, etc.) sin confirmarlas.
  // `icon` es una clave que components/sections/why-us-section.tsx traduce.
  whyUsSection: {
    eyebrow: "Por qué FARUM",
    title: "Trabajamos con reglas claras",
    description: "Esto es lo que puedes esperar de nosotros, de principio a fin.",
    badges: [
      { icon: "invoice", label: "Boleta o factura" },
      { icon: "team", label: "Reunión con ambos socios" },
      { icon: "support", label: "Trato directo, sin call center" },
      { icon: "clients", label: "Cupos limitados" },
    ],
  },

  // Sección "Prospección responsable".
  // TEXTO GENÉRICO, PENDIENTE DE REVISIÓN LEGAL antes de darlo por definitivo:
  // describe principios, no certifica cumplimiento de ninguna ley.
  responsible: {
    eyebrow: "Prospección responsable",
    title: "Contactar a otras empresas con respeto",
    description:
      "Cuando prospectamos en nombre de tu empresa, lo hacemos con estos criterios.",
    principles: [
      {
        icon: "professional",
        title: "Foco en contactos profesionales",
        description:
          "Nos dirigimos a personas por su rol en una empresa, no a consumidores finales.",
      },
      {
        icon: "clear",
        title: "Mensajes claros",
        description:
          "Decimos quiénes somos y para qué escribimos, sin engaños ni promesas imposibles.",
      },
      {
        icon: "optout",
        title: "Baja inmediata",
        description:
          "Si alguien no quiere recibir más contactos, lo respetamos y dejamos de escribirle.",
      },
      {
        icon: "data",
        title: "Cuidado de los datos",
        description:
          "Buscamos tratar la información con cuidado y conforme a la normativa chilena vigente.",
      },
    ],
  },

  // WhatsApp. El número alimenta el botón flotante, el QR, el contacto y el
  // `telephone` del JSON-LD (app/layout.tsx): cámbialo solo acá.
  whatsappNumber: "56964605635",
  whatsappNumberDisplay: "+56 9 6460 5635",
  whatsappDefaultMessage: MEETING_MESSAGE,
  whatsappMessages: {
    meeting: MEETING_MESSAGE,
    qr: `Hola ${BUSINESS_NAME}, vi el código QR y quiero agendar una reunión.`,
    nextClient: `Hola ${BUSINESS_NAME}, quiero que mi empresa sea una de las próximas en trabajar con ustedes.`,
  },

  contactEmail: "farum.cl@gmail.com",

  address: {
    street: "Portugal 373, Of. 211",
    comuna: "Santiago",
    region: "Región Metropolitana",
    country: "CL",
  },

  hours: {
    weekdays: "Lunes a viernes: 11:00 a 15:00 hrs, presencial",
    saturday: "Sábado: 10:00 a 14:00 hrs, solo por videollamada Zoom",
  },

  // Sección de contacto / cierre.
  contactSection: {
    eyebrow: "Hablemos",
    title: "Agenda tu reunión por WhatsApp",
    description:
      "Escríbenos y coordinamos una reunión con ambos socios para conocer tu negocio y armar tu propuesta a medida.",
    buttonLabel: "Agenda tu reunión por WhatsApp",
    qrCaption: "Escanea y escríbenos",
  },

  faq: [
    {
      question: `¿Qué hace ${BUSINESS_NAME}?`,
      answer:
        "Reunimos en un solo equipo cuatro servicios: prospección de clientes, agendamiento y confirmación de reuniones, presencia digital (página web, indexación en Google, Google Ads y posicionamiento SEO) y desarrollo de software y apps.",
    },
    {
      question: "¿A quién le sirve?",
      answer:
        "A empresas y pymes de Chile que quieren llegar a más clientes y hacer que las encuentren, sin tener que armar un equipo propio para cada tarea.",
    },
    {
      question: "¿Cómo se cobra?",
      answer:
        "Con una suscripción mensual a tu medida. No hay paquetes cerrados: en la reunión definimos qué servicios necesitas y armamos el presupuesto según los que tomes.",
    },
    {
      question: "¿Qué incluye la presencia digital?",
      answer:
        "Página web con dominio y hosting, indexación en Google, campañas de Google Ads, posicionamiento SEO y en IA, y herramientas de integración digital como las tarjetas NFC. Tú eliges qué parte necesitas.",
    },
    {
      question: "¿Me aseguran un lugar en Google?",
      answer:
        "No, porque nadie puede prometer un puesto exacto. Lo que hacemos es una estrategia de búsqueda constante, con un método específico, que ajustamos mes a mes para que compitas de verdad.",
    },
    {
      question: "¿Qué es la tarjeta NFC y cómo se usa?",
      answer:
        "Es una tarjeta con un chip NFC, parte de nuestras herramientas de integración digital. Tu cliente la acerca a la parte trasera de su celular y se abre lo que dejamos configurado, sin instalar nada: por ejemplo, una reseña en Google, tus redes sociales o tus datos de contacto.",
    },
    {
      question: "¿Cómo cuidan los datos de las personas que contactan?",
      answer:
        "Nos dirigimos a personas por su rol profesional, decimos quiénes somos y para qué escribimos, y si alguien no quiere recibir más contactos, dejamos de escribirle. Buscamos tratar la información conforme a la normativa chilena vigente.",
    },
    {
      question: "¿Con quién voy a hablar?",
      answer:
        "Directo con nosotros por WhatsApp. No hay call center ni tickets de soporte, y las reuniones son con ambos socios.",
    },
    {
      question: "¿Por qué no lo hago con mi propio equipo?",
      answer:
        "Prospectar, mantener tu presencia digital y desarrollar software consumen muchas horas. Con FARUM tu equipo se dedica a atender y cerrar, y nosotros nos ocupamos del resto.",
    },
  ],
} as const;

/** Construye un link de WhatsApp (wa.me) con mensaje precargado. */
export function waLink(message: string = siteConfig.whatsappDefaultMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
