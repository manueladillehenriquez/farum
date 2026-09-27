import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

/**
 * Verifica EN EL SERVIDOR que quien hace la petición es el admin.
 * Se llama al inicio de cada página del panel y de cada Server Action:
 * el middleware es solo la primera barrera.
 *
 * Devuelve el cliente de Supabase con la sesión del admin, así que todo lo
 * que se haga con él sigue sujeto a RLS.
 */
export async function requireAdmin() {
  const supabase = await createSessionClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  return { supabase, user };
}
