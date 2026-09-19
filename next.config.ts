import type { NextConfig } from "next";

// El proyecto se publica como repo de proyecto en GitHub Pages
// (https://<usuario>.github.io/<nombre-del-repo>/), así que en ese entorno
// necesita un basePath con el nombre del repo. GitHub Actions define
// automáticamente la variable de entorno GITHUB_ACTIONS=true, así que
// el basePath solo se activa ahí — tu build local (para subir a un
// hosting tradicional) sigue sirviendo desde la raíz, sin cambios.
//
// Si más adelante conectas un dominio propio a este repo de GitHub
// Pages, quita el basePath/assetPrefix de abajo: un dominio propio
// sirve el sitio desde la raíz, igual que un hosting tradicional.
// OJO: `repoName` debe coincidir con el nombre real del repo en GitHub
// (https://github.com/manueladillehenriquez/farum). Si lo renombras,
// cámbialo acá, en NEXT_PUBLIC_BASE_PATH del workflow y en la URL de
// app/layout.tsx, app/sitemap.ts y app/robots.ts.
const repoName = "farum";
const isGithubActionsBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  // Exporta el sitio como HTML/CSS/JS estático puro (carpeta `out/`),
  // para poder subirlo a cualquier hosting estático (GitHub Pages,
  // cPanel, Hostinger, etc.).
  output: "export",
  images: {
    // El optimizador de imágenes de Next.js necesita un servidor Node
    // corriendo; un hosting estático no lo tiene, así que se desactiva
    // y las imágenes (logos de marca y de clientes) se sirven tal cual.
    unoptimized: true,
  },
  ...(isGithubActionsBuild && {
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  }),
};

export default nextConfig;
