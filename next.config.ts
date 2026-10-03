import type { NextConfig } from "next";

// El sitio se sirve desde www.farum.cl (dominio propio, ver /public/CNAME
// y la configuración de GitHub Pages), así que se exporta siempre desde
// la raíz — sin basePath ni assetPrefix, igual que cualquier hosting
// estático tradicional (cPanel, Hostinger, etc.).
const nextConfig: NextConfig = {
  // Exporta el sitio como HTML/CSS/JS estático puro (carpeta `out/`),
  // para poder subirlo a cualquier hosting estático.
  output: "export",
  images: {
    // El optimizador de imágenes de Next.js necesita un servidor Node
    // corriendo; un hosting estático no lo tiene, así que se desactiva
    // y las imágenes (logos de marca y de clientes) se sirven tal cual.
    unoptimized: true,
  },
};

export default nextConfig;
