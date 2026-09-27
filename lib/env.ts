/**
 * env.ts — variables de entorno PÚBLICAS (seguras para el navegador).
 * ------------------------------------------------------------------
 * Solo lo que empieza con NEXT_PUBLIC_ y por lo tanto viaja en el bundle.
 * Los secretos (service role, Transbank, Turnstile secret) viven en
 * lib/server/env.ts, que está marcado `server-only`: si algún componente
 * cliente intenta importarlo, el build falla.
 *
 * Next.js reemplaza `process.env.NEXT_PUBLIC_X` en tiempo de build solo si
 * se escribe literal, por eso no se accede por nombre dinámico.
 * ------------------------------------------------------------------
 */

/**
 * Origen del sitio, sin "/" final. Prioridad:
 *  1. NEXT_PUBLIC_SITE_URL, si está definida (override explícito).
 *  2. En un preview de Vercel, la URL de la rama: Webpay devuelve al cliente a
 *     esta URL, y en el preview debe ser la del preview, no la de producción.
 *  3. El dominio de producción.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const branchUrl = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" && branchUrl) {
    return `https://${branchUrl}`;
  }

  return "https://www.farum.cl";
}

/** URL canónica del sitio, sin "/" final. */
export const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");

/** Site key de Cloudflare Turnstile (pública por diseño). */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * URL y clave anónima de Supabase. Devuelve null si faltan (por ejemplo en
 * un clon recién hecho sin .env.local) para que el sitio marketing siga
 * funcionando y solo las secciones de tienda muestren un aviso.
 *
 * La URL se reduce a su origen: el panel de Supabase muestra a veces la URL de
 * la API REST (".../rest/v1/") y el cliente espera solo la raíz del proyecto.
 * Con el sufijo, cada consulta iba a "/rest/v1/rest/v1/..." y fallaba.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!rawUrl || !anonKey) return null;

  try {
    return { url: new URL(rawUrl).origin, anonKey };
  } catch {
    return null;
  }
}
