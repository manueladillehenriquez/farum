/**
 * Validación de imágenes subidas desde el panel admin.
 *
 * NUNCA se confía en la extensión ni en el `Content-Type` que declara el
 * navegador: se inspeccionan los primeros bytes del archivo (firma / "magic
 * bytes") para saber qué es realmente. Solo JPEG, PNG y WebP, con tope de
 * tamaño. La extensión y el tipo MIME que se guardan salen de la firma
 * detectada, no de lo que dijo el usuario.
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB (igual que el bucket)

export type DetectedImage = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
};

export function detectImageType(bytes: Uint8Array): DetectedImage | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) {
    return { mime: "image/png", ext: "png" };
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export type ImageCheck =
  | { ok: true; image: DetectedImage; bytes: Uint8Array }
  | { ok: false; error: string };

/** Valida tamaño y contenido real de un archivo subido. */
export async function checkImageFile(file: File): Promise<ImageCheck> {
  if (file.size === 0) return { ok: false, error: "El archivo está vacío." };
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "La imagen supera el máximo de 2 MB." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = detectImageType(bytes);
  if (!image) {
    return { ok: false, error: "Solo se permiten imágenes JPG, PNG o WebP." };
  }
  return { ok: true, image, bytes };
}
