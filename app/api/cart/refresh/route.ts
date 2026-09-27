import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/security/origin";
import { cartRefreshSchema } from "@/lib/validation/checkout";
import { getProductsByIds } from "@/lib/catalog";
import { getProductAction } from "@/lib/catalog-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cart/refresh { ids: string[] }
 *
 * El carrito vive en el navegador (localStorage), que el usuario puede
 * editar. Este endpoint devuelve el precio/estado/stock ACTUAL de cada
 * producto para mostrarlos bien. Es solo informativo: el monto que se cobra
 * siempre lo recalcula la base de datos al crear el pedido.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const ip = await getClientIp();
  if (!(await checkRateLimit({ scope: "cart-refresh", identifier: ip, ...LIMITS.cartRefresh }))) {
    return NextResponse.json({ ok: false, code: "RATE_LIMITED" }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > 8_000) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = cartRefreshSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const products = await getProductsByIds(parsed.data.ids);
  if (!products) {
    return NextResponse.json({ ok: false, code: "UNAVAILABLE" }, { status: 503 });
  }

  const items = products
    .map((p) => {
      const modo = p.category?.modo ?? "venta";
      const action = getProductAction(p, modo);
      return {
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen_url: p.imagen_url,
        stock: p.stock,
        available: action === "comprar",
      };
    });

  return NextResponse.json({ ok: true, items });
}
