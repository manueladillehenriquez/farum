"use client";

import { useEffect, useState } from "react";

interface RotatingWordProps {
  /** Palabras que se alternan, en orden y en bucle. */
  words: readonly string[];
  /** Milisegundos que permanece cada palabra. */
  interval?: number;
}

/**
 * RotatingWord
 * ------------------------------------------------------------------
 * Alterna palabras dentro de una frase (ej. "Tu [empresa] al
 * siguiente nivel"), con un fundido más un leve desplazamiento vertical.
 *
 * - Todas las palabras se apilan en la misma celda de una grilla, así que
 *   el ancho reservado es el de la más larga: el resto del titular no se
 *   mueve cuando la palabra cambia.
 * - El primer render (servidor / export estático) muestra la primera
 *   palabra; la rotación empieza recién tras el montaje.
 * - Con `prefers-reduced-motion` no rota ni anima: se queda en la primera.
 * - Es puramente visual: quien lo use debe entregar el texto completo a
 *   lectores de pantalla y buscadores por otro lado (ver el <h1> del hero).
 * ------------------------------------------------------------------
 */
export function RotatingWord({ words, interval = 1000 }: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || words.length < 2) {
      setIndex(0);
      return undefined;
    }
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [reducedMotion, words.length, interval]);

  const previous = (index - 1 + words.length) % words.length;

  return (
    // `justify-items-start` + `text-left`: el titular es `text-center`, y sin esto
    // las palabras más cortas se centran en el ancho reservado y dejan un hueco
    // entre "tu" y la palabra.
    <span className="inline-grid justify-items-start text-left" aria-hidden="true">
      {words.map((word, i) => {
        // La activa se ve; la que acaba de salir sube y se desvanece;
        // las que esperan quedan abajo, listas para entrar desde ahí.
        const state = i === index ? "active" : i === previous ? "leaving" : "waiting";
        return (
          <span
            key={word}
            className={`col-start-1 row-start-1 ${
              reducedMotion ? "" : "transition-[opacity,transform] duration-300 ease-out"
            } ${
              state === "active"
                ? "translate-y-0 opacity-100"
                : state === "leaving"
                  ? "-translate-y-[0.3em] opacity-0"
                  : "translate-y-[0.3em] opacity-0"
            }`}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
