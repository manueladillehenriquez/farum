import "server-only";

/**
 * Notificaciones de pedidos.
 *
 * TODO(email): todavía no hay proveedor de correo transaccional definido
 * (Resend, Postmark, SES…). Cuando se elija uno, enviar acá el correo de
 * confirmación al cliente y el aviso de pedido nuevo al admin. El flujo de
 * pago llama a esta función después de confirmar el pago, así que no hará
 * falta tocar nada más.
 *
 * Mientras tanto no hace nada a propósito: NO se registran datos personales
 * del cliente en los logs.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub a propósito
export async function notifyOrderPaid(_orderId: string): Promise<void> {
  // Sin proveedor de email configurado. Ver TODO arriba.
}
