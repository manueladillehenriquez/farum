/**
 * Opciones de la cookie de sesión del admin (compartidas por el middleware y
 * por el cliente de servidor; por eso no es un módulo `server-only`).
 *
 *  - httpOnly: JavaScript del navegador no puede leerla (mitiga XSS).
 *  - secure  : solo por HTTPS en producción.
 *  - sameSite: "lax" (no se envía en POST cross-site → mitiga CSRF).
 *
 * Como el panel admin es 100% server-side (nunca se usa un cliente de
 * Supabase en el navegador), httpOnly no rompe nada.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
