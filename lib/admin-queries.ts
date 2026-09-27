import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Filtros ya validados con orderFiltersSchema. */
export interface OrderFilters {
  estado?: "pendiente" | "pagado" | "fallido" | "despachado";
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  q?: string;
}

/**
 * Límites de un día de Chile. Usa -03:00 (horario de verano); en invierno
 * (-04:00) el borde puede correrse a lo más una hora, aceptable para un
 * filtro de reportes.
 */
function dayStart(date: string) {
  return `${date}T00:00:00-03:00`;
}
function dayEnd(date: string) {
  return `${date}T23:59:59.999-03:00`;
}

/**
 * Deja solo caracteres seguros para el texto de búsqueda. Como el valor se
 * interpola en un filtro `.or()` de PostgREST, se eliminan comas, paréntesis,
 * comodines y demás caracteres que podrían alterar la consulta.
 */
export function safeSearchTerm(input: string): string {
  return input.replace(/[^\p{L}\p{N}@._ -]/gu, "").trim().slice(0, 60);
}

/** Aplica los filtros comunes de pedidos a una consulta de Supabase. */
export function applyOrderFilters<T>(query: T, filters: OrderFilters): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;
  if (filters.estado) q = q.eq("estado", filters.estado);
  if (filters.desde) q = q.gte("creado_en", dayStart(filters.desde));
  if (filters.hasta) q = q.lte("creado_en", dayEnd(filters.hasta));

  if (filters.q) {
    const term = safeSearchTerm(filters.q);
    if (term) {
      if (/^\d{1,12}$/.test(term)) {
        q = q.or(`numero.eq.${term},nombre_cliente.ilike.%${term}%,email.ilike.%${term}%`);
      } else {
        q = q.or(`nombre_cliente.ilike.%${term}%,email.ilike.%${term}%`);
      }
    }
  }
  return q as T;
}

export type AdminClient = SupabaseClient;
