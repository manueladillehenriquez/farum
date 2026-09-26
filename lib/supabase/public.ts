import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Cliente ANÓNIMO de Supabase, para lecturas públicas del catálogo desde
 * componentes de servidor. Usa la clave pública (anon), así que está
 * sujeto a RLS: solo ve categorías/productos activos.
 *
 * El navegador nunca habla directo con Supabase: todo pasa por el
 * servidor de Next.js, lo que reduce la superficie de ataque.
 *
 * Devuelve null si Supabase no está configurado.
 */
export function createPublicClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
