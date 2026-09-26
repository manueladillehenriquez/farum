import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/server/env";

/**
 * Cliente con la clave SERVICE_ROLE: se salta RLS. Usar SOLO en código de
 * servidor y SOLO para lo estrictamente necesario:
 *   - crear pedidos (fn_create_order) y confirmar pagos,
 *   - rate limiting,
 *   - leer el pedido de la página pública de confirmación.
 *
 * El panel admin NO usa este cliente: opera con la sesión del admin y
 * queda sujeto a RLS (mínimo privilegio).
 */
export function createServiceClient(): SupabaseClient {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL)");
  }
  return createClient(env.url, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
