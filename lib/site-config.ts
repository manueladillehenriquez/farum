/**
 * site-config.ts
 * ------------------------------------------------------------------
 * Toda la información del negocio (servicios, WhatsApp, dirección,
 * horarios, mensajes) vive en un solo lugar. Los componentes
 * de /components/sections la importan desde acá — así, para actualizar
 * un texto o el número de WhatsApp solo se edita este archivo.
 *
 * Giro vigente: tres servicios para empresas. NO hay precios en la web:
 * los socios (2026-10-05) decidieron informarlos solo en la reunión de
 * diagnóstico; los valores viven únicamente en el manual interno. No los
 * agregues acá ni cifras sin que el dueño las confirme.
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
  tagline: "Prospección con IA, presencia digital y software para tu empresa",
  description: `${BUSINESS_NAME} reúne prospección de clientes con IA (con agendamiento y confirmación de reuniones incluidos), presencia digital (indexación en Google, campañas de Google Ads y tarjetas NFC) y desarrollo de software y apps, para empresas y pymes de Chile.`,

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
      "Prospección de clientes con IA, presencia digital y desarrollo de software, en un solo equipo y con trato directo de los socios.",
    primaryButtonText: "Agenda tu reunión",
    secondaryButtonText: "Ver servicios",
  },

  // Sección de servicios: encabezado y las 3 líneas de servicio. `icon` es una
  // clave que components/sections/services-section.tsx traduce al ícono de
  // lucide. `quoteMessage` es el mensaje de WhatsApp del botón "Cotizar".
  // SIN precios: se informan en la reunión de diagnóstico (decisión de los
  // socios, 2026-10-05). `modules` lista los módulos sueltos de un servicio.
  services: {
    eyebrow: "Servicios",
    title: "Tres servicios, claros y sin letra chica",
    description:
      "Contrata solo lo que tu empresa necesita. Los valores te los informamos en la primera reunión.",
    quoteLabel: "Cotizar este servicio",
    pillars: [
      {
        icon: "prospect",
        title: "Prospección de clientes con IA",
        description:
          "Salimos a buscar a tus próximos clientes y te agendamos las reuniones.",
        items: [
          "Enviamos 100 correos diarios a un público segmentado",
          "Comunicación efectiva, no mensajes genéricos",
          "Agendamiento y confirmación de reuniones incluidos",
          "Recibes cada reunión por WhatsApp para que la confirmes",
        ],
        modules: [],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el servicio de prospección de clientes con IA.`,
      },
      {
        icon: "presence",
        title: "Presencia digital",
        description: "Que tu marca se vea, exista y se encuentre.",
        items: [],
        modules: [
          {
            name: "Indexación + sitemap",
            detail: "Registramos tu sitio en Google para que pueda mostrarlo.",
          },
          {
            name: "Campaña de Google Ads",
            detail: "Anuncios cuando buscan lo que ofreces. Elige tu plan abajo.",
          },
          {
            name: "Tarjetas NFC",
            detail: "Tu cliente la acerca al celular y se abre lo que configuramos.",
          },
        ],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el servicio de presencia digital.`,
      },
      {
        icon: "software",
        title: "Software y apps",
        description:
          "Desarrollamos la herramienta que tu negocio necesita y la dejamos funcionando.",
        items: ["Apps móviles", "Software a medida", "Páginas web"],
        modules: [],
        quoteMessage: `Hola ${BUSINESS_NAME}, quiero cotizar el desarrollo de software o de una app.`,
      },
    ],
  },

  // Detalle de las campañas de Google Ads por plan. No se publican valores:
  // el costo depende de lo competitivo que sea el negocio en Google y se
  // informa en la reunión de diagnóstico. `includedFrom` = primer plan (1 a 4) que lo incluye.
  googleAds: {
    eyebrow: "Google Ads",
    title: "Campañas de Google Ads: elige tu plan",
    description:
      "Cuatro planes, de menor a mayor alcance mensual. El valor depende de lo competitivo que sea tu negocio en Google y te lo informamos en la primera reunión.",
    plans: ["Plan 1", "Plan 2", "Plan 3", "Plan 4"],
    features: [
      { label: "Creación de avisos y selección de palabras clave", includedFrom: 1 },
      { label: "Optimización constante de la campaña", includedFrom: 1 },
      { label: "Red de display", includedFrom: 1 },
      { label: "Avisos en computadoras, teléfonos y tabletas", includedFrom: 1 },
      { label: "Atención directa de un socio", includedFrom: 1 },
      { label: "Plataforma de informes", includedFrom: 1 },
      { label: "Avisos con extensiones", includedFrom: 1 },
      { label: "Integración con Google Analytics", includedFrom: 1 },
      { label: "Creación de avisos gráficos para la red de display", includedFrom: 3 },
      { label: "Software de administración y optimización", includedFrom: 3 },
    ],
    note: "No prometemos un número de visitas ni de ventas.",
    quoteLabel: "Cotizar",
    quoteMessage: (plan: string) =>
      `Hola ${BUSINESS_NAME}, quiero cotizar una campaña de Google Ads (${plan}).`,
  },

  // Sección "Cómo trabajamos": pasos desde el primer contacto.
  process: {
    eyebrow: "Cómo trabajamos",
    title: "De la primera reunión a tu servicio funcionando",
    steps: [
      {
        title: "Reunión de diagnóstico",
        description:
          "Conversamos sobre tu negocio, tus clientes ideales y los horarios en que puedes recibir reuniones.",
      },
      {
        title: "Propuesta clara",
        description:
          "Te informamos los valores y te enviamos una propuesta solo con los servicios que elegiste.",
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

  // Sección "Política de prospección responsable" (va cerca del final de la
  // página). TEXTO GENÉRICO, PENDIENTE DE REVISIÓN LEGAL antes de darlo por
  // definitivo: describe principios, no certifica cumplimiento de ninguna ley.
  responsible: {
    eyebrow: "Política",
    title: "Política de prospección responsable",
    description:
      "Aplica a toda la prospección que hacemos en nombre de tu empresa, principalmente por correo.",
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

  // Mapa de la oficina (se muestra en la sección de contacto). `query` es lo
  // que Google Maps busca: mantenlo igual a `address`.
  map: {
    query: "Portugal 373, Santiago, Chile",
    title: "Mapa de la oficina de FARUM",
    directionsLabel: "Cómo llegar",
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
      "Escríbenos y coordinamos una reunión con ambos socios para conocer tu negocio y ver qué servicios te convienen.",
    buttonLabel: "Agenda tu reunión por WhatsApp",
    qrCaption: "Escanea y escríbenos",
  },

  faq: [
    {
      question: `¿Qué hace ${BUSINESS_NAME}?`,
      answer:
        "Ofrecemos tres servicios en un solo equipo: prospección de clientes con IA (con agendamiento y confirmación de reuniones incluidos), presencia digital (indexación en Google, campañas de Google Ads y tarjetas NFC) y desarrollo de software y apps.",
    },
    {
      question: "¿A quién le sirve?",
      answer:
        "A empresas y pymes de Chile que quieren llegar a más clientes y hacer que las encuentren, sin tener que armar un equipo propio para cada tarea.",
    },
    {
      question: "¿Cuánto cuesta?",
      answer:
        "Depende de los servicios que elijas. Los valores te los informamos en la primera reunión de diagnóstico, sin compromiso, y después te enviamos una propuesta solo con lo que necesites.",
    },
    {
      question: "¿Cómo funciona la prospección de clientes?",
      answer:
        "Definimos tu nicho, la IA analiza el mercado y redactamos un correo efectivo, no genérico, que enviamos a un público segmentado: 100 correos diarios. Agendamos la reunión con quienes confirman y te avisamos por WhatsApp y correo. Los horarios en que puedes recibir reuniones los definimos juntos en la primera reunión de diagnóstico.",
    },
    {
      question: "¿Puedo cancelar cuando quiera?",
      answer:
        "Sí. Cuando ya no quieras el servicio, lo damos de baja, sin costo ni letra chica. Y si más adelante decides volver, lo retomamos.",
    },
    {
      question: "¿Me aseguran un lugar en Google o reuniones con clientes?",
      answer:
        "No, porque nadie puede prometer un puesto exacto ni un resultado de ventas. Lo que hacemos es un trabajo constante, con método, que ajustamos mes a mes. Lo que sí te decimos con claridad es cuántos correos enviamos y qué incluye cada servicio.",
    },
    {
      question: "¿Qué es la tarjeta NFC y cómo se usa?",
      answer:
        "Es una tarjeta con un chip NFC. Tu cliente la acerca a la parte trasera de su celular y se abre lo que dejamos configurado, sin instalar nada: por ejemplo, una reseña en Google, tus redes sociales o tus datos de contacto.",
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
