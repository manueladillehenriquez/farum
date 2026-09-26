import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Rate limiting con contadores de ventana fija en Postgres
 * (función public.rate_limit_hit, solo ejecutable por service_role).
 *
 * FALLA CERRADO: si la base no responde, se deniega. Preferimos rechazar
 * un intento legítimo a dejar sin freno un endpoint sensible.
 */

/** IP del cliente tal como la informa la plataforma (Vercel). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return h.get("x-real-ip")?.trim() || forwarded || "unknown";
}

/** Hash de la clave: no se guardan IPs ni correos en claro en la tabla. */
function hashBucket(scope: string, identifier: string): string {
  const digest = createHash("sha256").update(identifier).digest("hex").slice(0, 32);
  return `${scope}:${digest}`;
}

export async function checkRateLimit(options: {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_bucket: hashBucket(options.scope, options.identifier),
      p_limit: options.limit,
      p_window_seconds: options.windowSeconds,
    });
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

/** Límites por endpoint, centralizados para poder ajustarlos en un lugar. */
export const LIMITS = {
  login: { limit: 10, windowSeconds: 15 * 60 }, // por IP
  loginPerEmail: { limit: 5, windowSeconds: 15 * 60 }, // por cuenta
  checkout: { limit: 10, windowSeconds: 10 * 60 },
  cartRefresh: { limit: 60, windowSeconds: 60 },
  webpayReturn: { limit: 60, windowSeconds: 60 },
} as const;
