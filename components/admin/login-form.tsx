"use client";

import { useActionState, useState } from "react";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { adminButton, adminInput, Field } from "@/components/admin/ui";
import { loginAction, type LoginState } from "@/app/admin/(auth)/login/actions";

export function LoginForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [captchaToken, setCaptchaToken] = useState("");
  // Cada intento consume el token de Turnstile; se pide uno nuevo tras cada respuesta.
  const [resetKey, setResetKey] = useState(0);

  return (
    <form
      action={(formData) => {
        action(formData);
        setCaptchaToken("");
        setResetKey((n) => n + 1);
      }}
      className="flex flex-col gap-5"
    >
      <Field label="Correo" name="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          className={adminInput}
        />
      </Field>
      <Field label="Contraseña" name="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={adminInput}
        />
      </Field>

      <input type="hidden" name="captchaToken" value={captchaToken} />
      <TurnstileWidget siteKey={siteKey} onToken={setCaptchaToken} resetKey={resetKey} />

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-foreground">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending || !captchaToken} className={adminButton}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
