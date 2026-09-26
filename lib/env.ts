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

/** URL canónica del sitio, sin "/" final. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.farum.cl"
).replace(/\/+$/, "");

/** Site key de Cloudflare Turnstile (pública por diseño). */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * URL y clave anónima de Supabase. Devuelve null si faltan (por ejemplo en
 * un clon recién hecho sin .env.local) para que el sitio marketing siga
 * funcionando y solo las secciones de tienda muestren un aviso.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
