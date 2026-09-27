import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Acceso a pedidos desde el servidor (service_role). Ninguna de estas
 * funciones se expone al navegador: solo las llaman API routes y
 * componentes de servidor.
 */

export type OrderEstado = "pendiente" | "pagado" | "fallido" | "despachado";

export interface CreatedOrder {
  order_id: string;
  public_token: string;
  transbank_order_id: string;
  total: number;
}

export class OrderError extends Error {
  constructor(
    public code: "PRODUCT_UNAVAILABLE" | "OUT_OF_STOCK" | "CART_INVALID" | "TOTAL_OUT_OF_RANGE" | "UNKNOWN",
    public productId?: string,
  ) {
    super(code);
    this.name = "OrderError";
  }
}

/**
 * Crea el pedido con su detalle. El precio, el nombre y el total los calcula
 * la base de datos (fn_create_order); acá solo se manda producto + cantidad.
 */
export async function createOrder(input: {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  comuna: string;
  notas: string;
  items: { product_id: string; cantidad: number }[];
}): Promise<CreatedOrder> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("fn_create_order", {
    p_nombre: input.nombre,
    p_email: input.email,
    p_telefono: input.telefono,
    p_direccion: input.direccion,
    p_comuna: input.comuna,
    p_notas: input.notas,
    p_items: input.items,
  });

  if (error) {
    const match = /^(PRODUCT_UNAVAILABLE|OUT_OF_STOCK|CART_INVALID|TOTAL_OUT_OF_RANGE)(?::([0-9a-f-]{36}))?/.exec(
      error.message,
    );
    if (match) {
      throw new OrderError(match[1] as OrderError["code"], match[2]);
    }
    throw new OrderError("UNKNOWN");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new OrderError("UNKNOWN");
  return row as CreatedOrder;
}

export async function setTransbankToken(orderId: string, token: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ transbank_token: token })
    .eq("id", orderId)
    .eq("estado", "pendiente");
  if (error) throw new Error("No se pudo guardar el token de Transbank");
}

/** Marca un pedido pendiente como fallido (no toca los ya pagados). */
export async function markOrderFailed(orderId: string) {
  const supabase = createServiceClient();
  await supabase
    .from("orders")
    .update({ estado: "fallido" })
    .eq("id", orderId)
    .eq("estado", "pendiente");
}

/** Confirma el pago (idempotente): true solo la primera vez. */
export async function confirmOrderPayment(
  orderId: string,
  authorizationCode: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("fn_confirm_order_payment", {
    p_order_id: orderId,
    p_auth_code: authorizationCode,
  });
  if (error) throw new Error("No se pudo confirmar el pago del pedido");
  return data === true;
}

export interface OrderForReturn {
  id: string;
  public_token: string;
  estado: OrderEstado;
  total: number;
  transbank_order_id: string;
}

/** Pedido a partir del token de Transbank o de la orden de compra. */
export async function findOrderForReturn(by: {
  transbankToken?: string;
  buyOrder?: string;
}): Promise<OrderForReturn | null> {
  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select("id, public_token, estado, total, transbank_order_id");

  if (by.transbankToken) query = query.eq("transbank_token", by.transbankToken);
  else if (by.buyOrder) query = query.eq("transbank_order_id", by.buyOrder);
  else return null;

  const { data } = await query.maybeSingle();
  return (data as OrderForReturn | null) ?? null;
}

export interface PublicOrder {
  numero: number;
  estado: OrderEstado;
  total: number;
  creado_en: string;
  nombre_cliente: string;
  email: string;
  order_items: { nombre_producto: string; cantidad: number; precio_unitario: number }[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Pedido para la página pública de confirmación. Se busca por un token
 * aleatorio no adivinable (no por el número correlativo), y la página
 * enmascara los datos personales.
 */
export async function getOrderByPublicToken(token: string): Promise<PublicOrder | null> {
  if (!UUID.test(token)) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "numero, estado, total, creado_en, nombre_cliente, email, order_items(nombre_producto, cantidad, precio_unitario)",
    )
    .eq("public_token", token)
    .maybeSingle();
  return (data as PublicOrder | null) ?? null;
}
