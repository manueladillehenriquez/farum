import Image from "next/image";
import { Clock, Package } from "lucide-react";
import { formatCLP } from "@/lib/format";
import {
  getProductAction,
  trustedImageUrl,
  type CategoryModo,
  type Product,
} from "@/lib/catalog-types";
import { serviceQuoteMessage, siteConfig, waLink } from "@/lib/site-config";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

/**
 * Tarjeta de producto. El botón depende SOLO de los datos:
 *   - categoría "cotizar"        → "Cotizar" (abre WhatsApp)
 *   - próximamente / sin precio  → badge "Próximamente", botón deshabilitado
 *   - disponible con precio      → "Agregar al carrito"
 * Activar un producto es cargar precio + estado en /admin: sin tocar código.
 */
export function ProductCard({
  product,
  modo,
}: {
  product: Product;
  modo: CategoryModo;
}) {
  const { catalog } = siteConfig;
  const action = getProductAction(product, modo);
  const image = trustedImageUrl(product.imagen_url);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-background/60">
        {image ? (
          <Image
            src={image}
            alt={product.nombre}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Package aria-hidden="true" className="h-10 w-10 text-muted-foreground/50" />
        )}
        {action === "proximamente" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border">
            <Clock className="h-3.5 w-3.5 text-accent" />
            {catalog.soonBadge}
          </span>
        )}
        {action === "agotado" && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border">
            {catalog.outOfStock}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-instrument-serif text-xl text-foreground">{product.nombre}</h3>
          {product.descripcion && (
            <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
              {product.descripcion}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {action === "comprar" && product.precio !== null && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {formatCLP(product.precio)}
              </span>
              <span className="text-xs text-muted-foreground">{catalog.vatNote}</span>
            </div>
          )}

          {action === "comprar" && product.precio !== null && (
            <AddToCartButton
              product={{
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen_url: product.imagen_url,
                stock: product.stock,
              }}
            />
          )}

          {action === "cotizar" && (
            <>
              <p className="text-xs text-muted-foreground">{catalog.quoteNote}</p>
              <a
                href={waLink(serviceQuoteMessage(product.nombre))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--whatsapp-dark)]"
              >
                {catalog.quoteButton}
              </a>
            </>
          )}

          {(action === "proximamente" || action === "agotado") && (
            <>
              {action === "proximamente" && (
                <p className="text-xs text-muted-foreground">{catalog.soonNote}</p>
              )}
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
              >
                {action === "agotado" ? catalog.outOfStock : catalog.soonButton}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
