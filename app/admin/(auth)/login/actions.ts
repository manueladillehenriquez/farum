"use server";

import { redirect } from "next/navigation";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { createSessionClient } from "@/lib/supabase/session";
import { loginSchema } from "@/lib/validation/admin";

export interface LoginState {
  error?: string;
}

// Mensaje único para cualquier fallo de credenciales: no revela si el correo
// existe ni si el problema es la contraseña.
const GENERIC_ERROR = "Correo o contraseña incorrectos.";

/**
 * Login del admin (email + contraseña vía Supabase Auth).
 *
 * Orden de las defensas (de la más barata a la más cara):
 *   1. rate limit por IP           (freno a fuerza bruta distribuida por IP)
 *   2. validación Zod
 *   3. rate limit por correo       (freno a fuerza bruta contra una cuenta)
 *   4. Turnstile                   (anti-bots, verificado en el servidor)
 *   5. Supabase Auth               (la contraseña se compara con bcrypt allá)
 *   6. rol admin en app_metadata   (cualquier otro usuario se descarta)
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();

  if (!(await checkRateLimit({ scope: "login-ip", identifier: ip, ...LIMITS.login }))) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: GENERIC_ERROR };

  const { email, password } = parsed.data;

  if (
    !(await checkRateLimit({
      scope: "login-email",
      identifier: email,
      ...LIMITS.loginPerEmail,
    }))
  ) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  if (!(await verifyTurnstile(formData.get("captchaToken"), ip))) {
    return { error: "No pudimos verificar que eres una persona. Inténtalo de nuevo." };
  }

  const supabase = await createSessionClient();
  if (!supabase) return { error: "El panel no está configurado todavía." };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: GENERIC_ERROR };

  // Una cuenta válida que NO es admin nunca entra al panel.
  if (data.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: GENERIC_ERROR };
  }

  redirect("/admin");
}
