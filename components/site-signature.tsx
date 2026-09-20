/**
 * Firma "By Farum", fija en la esquina inferior derecha. Es la misma marca
 * que llevan el resto de las webs de Farum: texto pequeño en negrita cursiva
 * sobre una cinta oscura semitransparente pegada a la esquina, justo debajo
 * del botón de WhatsApp para no pisarlo.
 */
export function SiteSignature() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 right-0 z-[9999] select-none rounded-tl-lg bg-[rgba(15,15,20,0.55)] py-0.5 pl-[11px] pr-2.5 text-[11px] font-bold italic leading-[14px] tracking-[0.02em] text-white backdrop-blur-[4px]"
    >
      By Farum
    </div>
  );
}
