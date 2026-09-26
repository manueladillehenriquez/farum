/**
 * Protección CSRF para los endpoints JSON (/api/*).
 *
 * Un POST legítimo desde nuestro sitio siempre trae la cabecera `Origin`
 * con nuestro propio host. Un formulario de otro sitio no puede falsearla.
 * (Las Server Actions de Next.js ya hacen esta comprobación por sí solas.)
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
