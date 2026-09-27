import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/env";
import { SESSION_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

/**
 * Cliente de Supabase ligado a la sesión del admin (cookies httpOnly).
 * Sujeto a RLS: lo que pueda hacer depende del JWT
 * (app_metadata.role = "admin"). Devuelve null si Supabase no está configurado.
 */
export async function createSessionClient() {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, { ...options, ...SESSION_COOKIE_OPTIONS });
          }
        } catch {
          // Llamado desde un Server Component (solo lectura): se ignora;
          // el middleware ya refresca la sesión en cada request.
        }
      },
    },
  });
}
