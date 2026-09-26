"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

/**
 * Vacía el carrito del navegador una vez que el pedido está pagado.
 * (No se vacía antes: si el pago falla, el cliente conserva su carrito.)
 */
export function ClearCartOnPaid() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, [ready]);
  return null;
}
