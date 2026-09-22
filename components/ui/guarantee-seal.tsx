import type { ReactNode } from "react";

/**
 * Polígono de una roseta de 16 puntas (radio exterior 48 / interior 39,
 * sobre un viewBox de 100x100), calculado una sola vez. Es la silueta de
 * un sello de garantía real, no un simple círculo o cuadrado: refuerza
 * literalmente la idea de "sello" que pide la sección ¿Por qué elegirnos?
 */
const SEAL_POINTS =
  "50,2 57.61,11.75 68.37,5.65 71.67,17.57 83.94,16.06 82.43,28.33 94.35,31.63 88.25,42.39 98,50 88.25,57.61 94.35,68.37 82.43,71.67 83.94,83.94 71.67,82.43 68.37,94.35 57.61,88.25 50,98 42.39,88.25 31.63,94.35 28.33,82.43 16.06,83.94 17.57,71.67 5.65,68.37 11.75,57.61 2,50 11.75,42.39 5.65,31.63 17.57,28.33 16.06,16.06 28.33,17.57 31.63,5.65 42.39,11.75";

/**
 * GuaranteeSeal
 * ------------------------------------------------------------------
 * Envoltorio en forma de sello (roseta), con el ícono de lucide como
 * único hijo. Dos tonos del azul de marca (exterior / disco interior)
 * le dan volumen sin depender de un `<linearGradient>` con id, que se
 * duplicaría al repetir el componente en la misma página.
 * ------------------------------------------------------------------
 */
export function GuaranteeSeal({ children }: { children: ReactNode }) {
  return (
    <span className="relative flex h-20 w-20 flex-none items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full drop-shadow-[0_8px_16px_rgba(37,99,235,0.35)]"
      >
        <polygon points={SEAL_POINTS} fill="var(--brand)" />
        <circle cx="50" cy="50" r="31" fill="var(--brand-dark)" opacity="0.55" />
      </svg>
      <span className="relative text-white">{children}</span>
    </span>
  );
}
