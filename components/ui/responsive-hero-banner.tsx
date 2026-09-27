"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import GatewayFlow from "@/components/ui/gateway-flow";
import { RotatingWord } from "@/components/ui/rotating-word";

interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

interface ResponsiveHeroBannerProps {
  /** Texto de respaldo del logo (se usa solo si no se pasa `logoUrl`). */
  logoText?: string;
  /** Imagen del logo (versión clara, para el fondo oscuro del hero). */
  logoUrl?: string;
  navLinks?: readonly NavLink[];
  ctaButtonText?: string;
  ctaButtonHref?: string;
  badgeText?: string;
  badgeLabel?: string;
  /** Inicio del titular, antes de la palabra rotativa (ej. "Tu"). */
  title?: string;
  /** Palabras que se alternan en el titular (ej. empresa / negocio / pyme). */
  rotatingWords?: readonly string[];
  /** Milisegundos que permanece cada palabra rotativa. */
  rotatingInterval?: number;
  /** Fin del titular, después de la palabra rotativa. */
  titleLine2?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

/** Detecta si el usuario pidió reducir animaciones en su sistema. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * ResponsiveHeroBanner
 * ------------------------------------------------------------------
 * Adaptado del componente original (21st.dev) para FARUM:
 * - El fondo es `GatewayFlow` (líneas de flujo animadas que convergen
 *   al centro, donde vive el titular) en vez de una foto. Si el sistema
 *   pide reducir animaciones, el flujo se congela (`speed={0}`).
 * - `logoUrl` renderiza el logo como imagen; `logoText` queda como
 *   respaldo en texto.
 * - Se agregó el panel de menú móvil: el botón hamburguesa existía
 *   en el original pero no desplegaba ningún contenido.
 * - El titular incluye una palabra rotativa (`RotatingWord`); el <h1>
 *   conserva la frase completa como texto solo para lectores de pantalla
 *   y buscadores.
 * ------------------------------------------------------------------
 */
const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
  logoText = "FARUM",
  logoUrl,
  navLinks = [
    { label: "Quiénes somos", href: "#quienes-somos" },
    { label: "Qué incluye", href: "#servicios" },
    { label: "Agendar", href: "#agenda" },
    { label: "Preguntas", href: "#faq" },
  ],
  ctaButtonText = "Escríbenos",
  ctaButtonHref = "#contacto",
  badgeLabel = "Nuevo",
  badgeText = "Tu marca completa, con entrega en 7 días",
  title = "Tu",
  rotatingWords = ["empresa", "negocio", "pyme"],
  rotatingInterval = 1000,
  titleLine2 = "al siguiente nivel.",
  description = "Obtén tu Paquete Inicial hoy y lleva tu tarjeta NFC de regalo",
  primaryButtonText = "Quiero mi Paquete Inicial",
  primaryButtonHref = "#agenda",
  secondaryButtonText = "Ver qué incluye",
  secondaryButtonHref = "#servicios",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="inicio"
      className="w-full isolate min-h-screen overflow-hidden relative bg-black"
    >
      {/* Fondo animado: decorativo, no interactivo y oculto a lectores de pantalla */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <GatewayFlow
          className="h-full w-full"
          mode="dark"
          speed={reducedMotion ? 0 : 1}
          density={0.75}
        />
      </div>
      {/* Viñeta central: mantiene legible el texto justo donde convergen las líneas */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.4)_45%,rgba(0,0,0,0)_78%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      <header className="z-20 xl:top-4 relative">
        <div className="mx-6">
          <div className="flex items-center justify-between pt-4">
            {logoUrl ? (
              <a
                href="#inicio"
                aria-label={logoText}
                className="inline-flex items-center"
              >
                <Image
                  src={logoUrl}
                  alt={logoText}
                  width={592}
                  height={146}
                  priority
                  className="h-8 w-auto sm:h-9"
                />
              </a>
            ) : (
              <a
                href="#inicio"
                aria-label={logoText}
                className="text-2xl font-bold leading-none tracking-[0.2em] text-white font-sans"
              >
                {logoText}
              </a>
            )}

            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium hover:text-white font-sans transition-colors ${
                      link.isActive ? "text-white/90" : "text-white/80"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={ctaButtonHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 font-sans transition-colors"
                >
                  {ctaButtonText}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </nav>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Abrir o cerrar el menú"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white/90" />
              ) : (
                <Menu className="h-5 w-5 text-white/90" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav
              id="mobile-nav"
              className="md:hidden mt-3 flex flex-col gap-1 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1"
            >
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white font-sans transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={ctaButtonHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 font-sans"
              >
                {ctaButtonText}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </nav>
          )}
        </div>
      </header>

      <div className="z-10 relative">
        <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-28 px-6 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-white/90 rounded-full py-0.5 px-2 font-sans">
                {badgeLabel}
              </span>
              <span className="text-sm font-medium text-white/90 font-sans">
                {badgeText}
              </span>
            </div>

            <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-instrument-serif font-normal animate-fade-slide-in-2">
              {/* Frase completa para lectores de pantalla y buscadores; la
                  versión animada de abajo es solo visual (aria-hidden). */}
              <span className="sr-only">
                {`${title} ${rotatingWords[0]} ${titleLine2}`}
              </span>
              <span aria-hidden="true">
                {title}{" "}
                <RotatingWord
                  words={rotatingWords}
                  interval={rotatingInterval}
                  wordClassName="font-space-grotesk font-bold uppercase text-accent tracking-wide drop-shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                />
                <br className="hidden sm:block" />{" "}
                {titleLine2}
              </span>
            </h1>

            <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/80 max-w-2xl mt-6 mx-auto">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
              <a
                href={primaryButtonHref}
                className="inline-flex items-center gap-2 hover:bg-white/15 text-sm font-medium text-white bg-white/10 ring-white/15 ring-1 rounded-full py-3 px-5 font-sans transition-colors"
              >
                {primaryButtonText}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={secondaryButtonHref}
                className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm font-medium text-white/90 hover:text-white font-sans transition-colors"
              >
                {secondaryButtonText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHeroBanner;
