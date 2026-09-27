import "server-only";
import { serverEnv } from "@/lib/server/env";

/**
 * Verifica un token de Cloudflare Turnstile en el servidor. El token que
 * llega del navegador NO vale nada hasta que Cloudflare lo confirma acá.
 *
 * FALLA CERRADO: sin token, sin secret, o si Cloudflare no responde
 * → se rechaza.
 */
export async function verifyTurnstile(
  token: unknown,
  remoteIp?: string,
): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  try {
    const body = new URLSearchParams({
      secret: serverEnv.turnstileSecretKey,
      response: token,
    });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
