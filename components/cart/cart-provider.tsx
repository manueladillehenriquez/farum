"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  cartCount,
  cartSubtotal,
  maxQtyFor,
  parseStoredCart,
  type CartLine,
} from "@/lib/cart";

export interface CartProductInput {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  stock: number | null;
}

interface CartContextValue {
  lines: CartLine[];
  /** false hasta leer localStorage (evita parpadeos y desajustes de hidratación). */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (product: CartProductInput, cantidad?: number) => void;
  setQuantity: (id: string, cantidad: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Sincroniza precios/stock con el servidor y quita lo que ya no se vende. */
  refresh: () => Promise<{ removed: string[]; changed: boolean }>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  // Última versión del carrito, siempre al día. Las acciones leen de acá y no
  // de `lines`, para que dos cambios seguidos en el mismo instante no se pisen
  // (el estado de React solo se actualiza en el siguiente render).
  const linesRef = useRef<CartLine[]>([]);

  // Carga inicial + sincronización entre pestañas.
  useEffect(() => {
    const load = () => {
      let stored: CartLine[] = [];
      try {
        stored = parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
      } catch {
        stored = [];
      }
      linesRef.current = stored;
      setLines(stored);
    };
    load();
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage lleno o bloqueado: el carrito sigue vivo en memoria.
    }
  }, []);

  const add = useCallback<CartContextValue["add"]>(
    (product, cantidad = 1) => {
      const current = linesRef.current;
      const existing = current.find((l) => l.id === product.id);
      const limit = maxQtyFor({ stock: product.stock });
      if (limit <= 0) return;

      if (existing) {
        persist(
          current.map((l) =>
            l.id === product.id
              ? {
                  ...l,
                  precio: product.precio,
                  stock: product.stock,
                  cantidad: Math.min(l.cantidad + cantidad, limit),
                }
              : l,
          ),
        );
      } else {
        persist([
          ...current,
          {
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen_url: product.imagen_url,
            stock: product.stock,
            cantidad: Math.min(cantidad, limit),
          },
        ]);
      }
    },
    [persist],
  );

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    (id, cantidad) => {
      persist(
        linesRef.current
          .map((l) =>
            l.id === id
              ? { ...l, cantidad: Math.min(Math.max(cantidad, 0), maxQtyFor(l)) }
              : l,
          )
          .filter((l) => l.cantidad > 0),
      );
    },
    [persist],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    (id) => persist(linesRef.current.filter((l) => l.id !== id)),
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const refresh = useCallback<CartContextValue["refresh"]>(async () => {
    const snapshot = linesRef.current;
    if (snapshot.length === 0) return { removed: [], changed: false };
    try {
      const res = await fetch("/api/cart/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: snapshot.map((l) => l.id) }),
      });
      if (!res.ok) return { removed: [], changed: false };
      const data = (await res.json()) as {
        ok: boolean;
        items: {
          id: string;
          nombre: string;
          precio: number | null;
          imagen_url: string | null;
          stock: number | null;
          available: boolean;
        }[];
      };
      if (!data.ok) return { removed: [], changed: false };

      const byId = new Map(data.items.map((i) => [i.id, i]));
      const removed: string[] = [];
      let changed = false;

      const next: CartLine[] = [];
      for (const line of snapshot) {
        const fresh = byId.get(line.id);
        if (!fresh || !fresh.available || fresh.precio === null) {
          removed.push(line.nombre);
          changed = true;
          continue;
        }
        const limit = maxQtyFor({ stock: fresh.stock });
        const cantidad = Math.min(line.cantidad, limit);
        if (cantidad <= 0) {
          removed.push(line.nombre);
          changed = true;
          continue;
        }
        if (
          fresh.precio !== line.precio ||
          cantidad !== line.cantidad ||
          fresh.stock !== line.stock
        ) {
          changed = true;
        }
        next.push({
          ...line,
          nombre: fresh.nombre,
          precio: fresh.precio,
          imagen_url: fresh.imagen_url,
          stock: fresh.stock,
          cantidad,
        });
      }
      if (changed) persist(next);
      return { removed, changed };
    } catch {
      return { removed: [], changed: false };
    }
  }, [persist]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      add,
      setQuantity,
      remove,
      clear,
      refresh,
    }),
    [lines, ready, add, setQuantity, remove, clear, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
