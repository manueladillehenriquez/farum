import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/env";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/security/origin";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { checkoutRequestSchema } from "@/lib/validation/checkout";
import {
  createOrder,
  markOrderFailed,
  OrderError,
  setTransbankToken,
} from "@/lib/server/orders";
import { getWebpayTransaction } from "@/lib/server/webpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_000;

function fail(status: number, code: string, message: string, extra?: object) {
  return NextResponse.json({ ok: false, code, message, ...extra }, { status });
}

/**
 * POST /api/checkout
 *
 * 1. Verifica origen (CSRF), tamaño, rate limit y anti-bots.
 * 2. Valida TODO con Zod.
 * 3. Crea el pedido: el monto lo calcula la base de datos con los precios
 *    reales — el carrito del navegador solo aporta producto + cantidad.
 * 4. Crea la transacción en Webpay y devuelve la URL/token para redirigir.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return fail(403, "FORBIDDEN", "Solicitud no permitida.");
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit({ scope: "checkout", identifier: ip, ...LIMITS.checkout });
  if (!allowed) {
    return fail(429, "RATE_LIMITED", "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
  }

  // Cuerpo acotado + JSON válido.
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return fail(413, "TOO_LARGE", "La solicitud es demasiado grande.");
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud inválida.");
  }

  const parsed = checkoutRequestSchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.slice(0, 2).join(".");
      fieldErrors[key] ??= issue.message;
    }
    return fail(400, "VALIDATION", "Revisa los datos del formulario.", { fieldErrors });
  }
  const { customer, items, captchaToken } = parsed.data;

  if (!(await verifyTurnstile(captchaToken, ip))) {
    return fail(400, "CAPTCHA", "No pudimos verificar que eres una persona. Inténtalo de nuevo.");
  }

  // Crear el pedido (monto recalculado en la base de datos).
  let order;
  try {
    order = await createOrder({
      nombre: customer.nombre,
      email: customer.email,
      telefono: customer.telefono,
      direccion: customer.direccion,
      comuna: customer.comuna,
      notas: customer.notas,
      items: items.map((i) => ({ product_id: i.product_id, cantidad: i.cantidad })),
    });
  } catch (error) {
    if (error instanceof OrderError) {
      switch (error.code) {
        case "PRODUCT_UNAVAILABLE":
          return fail(409, error.code, "Un producto de tu carrito ya no está disponible. Actualiza tu carrito.", { productId: error.productId });
        case "OUT_OF_STOCK":
          return fail(409, error.code, "No hay stock suficiente de un producto. Ajusta las cantidades.", { productId: error.productId });
        case "CART_INVALID":
        case "TOTAL_OUT_OF_RANGE":
          return fail(400, error.code, "Tu carrito no es válido. Revísalo e inténtalo de nuevo.");
      }
    }
    console.error("[checkout] error creando pedido");
    return fail(500, "SERVER", "No pudimos crear tu pedido. Inténtalo de nuevo en unos minutos.");
  }

  // Crear la transacción en Webpay con el monto de la BASE DE DATOS.
  try {
    const tx = getWebpayTransaction();
    const created = await tx.create(
      order.transbank_order_id,
      order.public_token,
      order.total,
      `${SITE_URL}/api/webpay/retorno`,
    );
    if (!created?.token || !created?.url) throw new Error("Respuesta inválida de Webpay");
    await setTransbankToken(order.order_id, created.token);
    return NextResponse.json({ ok: true, url: created.url, token: created.token });
  } catch {
    await markOrderFailed(order.order_id);
    console.error("[checkout] error creando transacción Webpay", { order: order.order_id });
    return fail(502, "PAYMENT_GATEWAY", "No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos.");
  }
}
