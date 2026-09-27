"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          language?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Widget de Cloudflare Turnstile (anti-bots).
 * `onToken` recibe el token cuando el visitante pasa la verificación y ""
 * cuando expira o falla. El token se valida SIEMPRE en el servidor
 * (lib/security/turnstile.ts): este componente solo lo obtiene.
 * Cambiar `resetKey` reinicia el widget (los tokens son de un solo uso).
 */
export function TurnstileWidget({
  siteKey,
  onToken,
  resetKey = 0,
}: {
  siteKey: string;
  onToken: (token: string) => void;
  resetKey?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  // Guardamos el callback en un ref para no re-renderizar el widget cuando
  // cambia la identidad de la función.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) return;
    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      language: "es",
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(""),
      "error-callback": () => onTokenRef.current(""),
    });
    return () => {
      window.turnstile?.remove(widgetId);
    };
  }, [scriptReady, siteKey, resetKey]);

  if (!siteKey) {
    return (
      <p role="alert" className="text-sm text-muted-foreground">
        La verificación anti-bots no está configurada.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
