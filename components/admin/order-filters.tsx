import { adminButton, adminButtonGhost, adminInput } from "@/components/admin/ui";

/** Filtros por GET (sin JS): la URL guarda los filtros y se puede compartir. */
export function OrderFilters({
  action,
  values,
  showEstado = true,
  showSearch = true,
}: {
  action: string;
  values: { estado?: string; desde?: string; hasta?: string; q?: string };
  showEstado?: boolean;
  showSearch?: boolean;
}) {
  return (
    <form
      action={action}
      method="get"
      className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4"
    >
      {showSearch && (
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="mb-1 block text-xs text-muted-foreground">
            Buscar (nombre, correo o N.º de pedido)
          </label>
          <input id="q" name="q" defaultValue={values.q ?? ""} maxLength={100} className={adminInput} />
        </div>
      )}
      {showEstado && (
        <div>
          <label htmlFor="estado" className="mb-1 block text-xs text-muted-foreground">
            Estado
          </label>
          <select id="estado" name="estado" defaultValue={values.estado ?? ""} className={adminInput}>
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="despachado">Despachado</option>
            <option value="fallido">Fallido</option>
          </select>
        </div>
      )}
      <div>
        <label htmlFor="desde" className="mb-1 block text-xs text-muted-foreground">
          Desde
        </label>
        <input id="desde" name="desde" type="date" defaultValue={values.desde ?? ""} className={adminInput} />
      </div>
      <div>
        <label htmlFor="hasta" className="mb-1 block text-xs text-muted-foreground">
          Hasta
        </label>
        <input id="hasta" name="hasta" type="date" defaultValue={values.hasta ?? ""} className={adminInput} />
      </div>
      <button type="submit" className={adminButton}>
        Filtrar
      </button>
      <a href={action} className={adminButtonGhost}>
        Limpiar
      </a>
    </form>
  );
}
