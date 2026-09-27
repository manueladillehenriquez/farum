/**
 * Sanitización de texto ingresado por usuarios (clientes en el checkout y
 * el admin en los formularios).
 *
 * Defensa en profundidad contra XSS:
 *   1. React ya escapa todo lo que se renderiza como texto, y en el sitio
 *      NO se usa dangerouslySetInnerHTML con datos de usuarios.
 *   2. Además, acá se descartan caracteres de control y `<` `>` de los
 *      campos de texto libre, para que nada peligroso llegue a la base de
 *      datos (y de ahí a mails, exportaciones u otros consumidores futuros).
 */

// Caracteres de control (menos \n y \t), y controles Unicode de dirección
// que se usan para disfrazar texto.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‎‏‪-‮⁦-⁩]/g;
const ANGLE_BRACKETS = /[<>]/g;

/** Texto de una sola línea (nombre, dirección, comuna, título…). */
export function sanitizeLine(input: string): string {
  return input
    .normalize("NFC")
    .replace(CONTROL_CHARS, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(ANGLE_BRACKETS, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Texto multilínea (notas, descripciones): conserva saltos de línea. */
export function sanitizeMultiline(input: string): string {
  return input
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARS, "")
    .replace(ANGLE_BRACKETS, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
