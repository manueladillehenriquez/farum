import "server-only";

/**
 * Variables de entorno SECRETAS. `server-only` hace fallar el build si algún
 * componente cliente llega a importar este archivo, así que ninguna clave
 * de acá puede terminar en el bundle del navegador.
 *
 * Se leen de forma perezosa (al usarlas) para que `next build` no exija
 * secretos que solo hacen falta en runtime.
 */

export class MissingEnvError extends Error {
  constructor(name: string) {
    super(`Falta la variable de entorno ${name}`);
    this.name = "MissingEnvError";
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new MissingEnvError(name);
  return value;
}

export type TransbankEnvironment = "integration" | "production";

export const serverEnv = {
  /** Clave service_role de Supabase. SOLO servidor; se salta RLS. */
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  /** Secret de Cloudflare Turnstile (verificación en el servidor). */
  get turnstileSecretKey() {
    return required("TURNSTILE_SECRET_KEY");
  },
  /** "integration" (sandbox, por defecto) o "production". */
  get transbankEnvironment(): TransbankEnvironment {
    return process.env.TRANSBANK_ENV === "production"
      ? "production"
      : "integration";
  },
  /** Solo se exige en producción; en sandbox el SDK trae las de prueba. */
  get transbankCommerceCode() {
    return required("TRANSBANK_COMMERCE_CODE");
  },
  get transbankApiKey() {
    return required("TRANSBANK_API_KEY");
  },
};
