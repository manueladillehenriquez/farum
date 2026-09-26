import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/security/rate-limit";
import {
  confirmOrderPayment,
  findOrderForReturn,
  markOrderFailed,
} from "@/lib/server/orders";
import { notifyOrderPaid } from "@/lib/server/notifications";
import { getWebpayTransaction, type WebpayCommitResult } from "@/lib/server/webpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retorno de Webpay Plus. Transbank redirige acá al terminar (o abandonar)
 * el pago:
 *
 *   token_ws                  → el cliente pagó o fue rechazado: hay que hacer
 *                               COMMIT desde el servidor para confirmarlo.
 *   TBK_TOKEN + TBK_ORDEN_...  → el cliente abortó/canceló (timeout o botón
 *                               "anular"): no hay nada que confirmar.
 *
 * El navegador NUNCA decide si un pedido está pagado: solo el commit
 * que hace este servidor contra Transbank, verificado contra el pedido.
 */

const TOKEN = /^[A-Za-z0-9]{20,100}$/;
const BUY_ORDER = /^FRM[A-Z0-9]{12}$/;

async function readParams(request: Request) {
  const params = new URL(request.url).searchParams;
  const get = (name: string) => {
    const value = params.get(name);
    return value === null ? undefined : value;
  };
  let tokenWs = get("token_ws");
  let tbkToken = get("TBK_TOKEN");
  let tbkOrder = get("TBK_ORDEN_COMPRA");

  // Transbank puede devolver por POST en algunos flujos.
  if (request.method === "POST") {
    try {
      const form = await request.formData();
      tokenWs ??= (form.get("token_ws") as string | null) ?? undefined;
      tbkToken ??= (form.get("TBK_TOKEN") as string | null) ?? undefined;
      tbkOrder ??= (form.get("TBK_ORDEN_COMPRA") as string | null) ?? undefined;
    } catch {
      // cuerpo no legible: se ignora
    }
  }
  return { tokenWs, tbkToken, tbkOrder };
}

function redirectTo(request: Request, path: string) {
  // 303: obliga al navegador a seguir con GET aunque el retorno haya sido POST.
  return NextResponse.redirect(new URL(path, request.url), 303);
}

async function handle(request: Request) {
  const ip = await getClientIp();
  if (!(await checkRateLimit({ scope: "webpay-return", identifier: ip, ...LIMITS.webpayReturn }))) {
    return redirectTo(request, "/carrito?pago=error");
  }

  const { tokenWs, tbkToken, tbkOrder } = await readParams(request);

  // ---- Cliente abortó / timeout (o error mixto): no se hace commit ----
  if (tbkToken || tbkOrder) {
    const order = await findOrderForReturn({
      transbankToken: tbkToken && TOKEN.test(tbkToken) ? tbkToken : undefined,
      buyOrder: tbkOrder && BUY_ORDER.test(tbkOrder) ? tbkOrder : undefined,
    });
    if (!order) return redirectTo(request, "/carrito?pago=error");
    await markOrderFailed(order.id); // no toca pedidos ya pagados
    return redirectTo(request, `/pedido/${order.public_token}`);
  }

  // ---- Retorno normal: commit del pago ----
  if (!tokenWs || !TOKEN.test(tokenWs)) {
    return redirectTo(request, "/carrito?pago=error");
  }

  const order = await findOrderForReturn({ transbankToken: tokenWs });
  if (!order) return redirectTo(request, "/carrito?pago=error");

  // Idempotencia: si ya se procesó (recarga de la página), no se repite.
  if (order.estado !== "pendiente") {
    return redirectTo(request, `/pedido/${order.public_token}`);
  }

  const tx = getWebpayTransaction();
  let result: WebpayCommitResult;
  let fromStatusLookup = false;
  try {
    result = await tx.commit(tokenWs);
  } catch {
    // El commit pudo haberse hecho ya (recarga, reintento) o haber fallado
    // por red; se consulta el estado real de la transacción.
    try {
      result = await tx.status(tokenWs);
      fromStatusLookup = true;
    } catch {
      // No sabemos el resultado. El pedido queda "pendiente" para revisión
      // manual en /admin (nunca se asume pagado ni fallido sin certeza).
      console.error("[webpay] no se pudo confirmar ni consultar", { order: order.id });
      return redirectTo(request, `/pedido/${order.public_token}`);
    }
  }

  const authorized = result.status === "AUTHORIZED" && result.response_code === 0;

  if (!authorized) {
    // Solo se marca "fallido" con un resultado DEFINITIVO. Un commit que
    // responde rechazo lo es. Si el dato viene de una consulta de estado,
    // "INITIALIZED" significa que el pago aún no ocurre: si lo marcáramos
    // fallido y el cliente pagara después, quedaría cobrado con el pedido
    // en "fallido". En cualquier otro caso se deja "pendiente".
    const definitive =
      !fromStatusLookup ||
      result.status === "FAILED" ||
      result.status === "REVERSED" ||
      result.status === "NULLIFIED";
    if (definitive) await markOrderFailed(order.id);
    return redirectTo(request, `/pedido/${order.public_token}`);
  }

  // El pago fue autorizado: verificar que corresponde EXACTAMENTE a este
  // pedido (orden de compra y monto) antes de darlo por pagado.
  const matches =
    result.buy_order === order.transbank_order_id && result.amount === order.total;

  if (!matches) {
    console.error("[webpay] la respuesta no coincide con el pedido", { order: order.id });
    await markOrderFailed(order.id);
    // Mejor esfuerzo: revertir el cobro para no dejar al cliente cobrado.
    try {
      if (typeof result.amount === "number") await tx.refund(tokenWs, result.amount);
    } catch {
      console.error("[webpay] no se pudo revertir el cobro", { order: order.id });
    }
    return redirectTo(request, `/pedido/${order.public_token}`);
  }

  const firstTime = await confirmOrderPayment(order.id, result.authorization_code ?? "");
  if (firstTime) await notifyOrderPaid(order.id);

  return redirectTo(request, `/pedido/${order.public_token}`);
}

export const GET = handle;
export const POST = handle;
