import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import { ProductCard } from "@/components/store/product-card";
import { CatalogUnavailable } from "@/components/store/catalog-unavailable";

// Regenera cada 60 s: un cambio de precio en /admin se ve en el catálogo en
// a lo sumo un minuto. (El precio que se COBRA siempre sale de la base.)
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catálogo de productos y servicios",
  description: siteConfig.catalog.description,
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogPage() {
  const { catalog } = siteConfig;
  const result = await getCatalog();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {catalog.eyebrow}
        </p>
        <h1 className="mt-3 font-instrument-serif text-4xl text-foreground sm:text-5xl">
          {catalog.title}
        </h1>
        <p className="mt-4 text-muted-foreground">{catalog.description}</p>
      </div>

      {result.status === "unavailable" ? (
        <CatalogUnavailable />
      ) : (
        <>
          <nav aria-label="Categorías" className="mb-14 flex flex-wrap justify-center gap-2">
            {result.categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalogo/${category.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {category.nombre}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-16">
            {result.categories.map((category) => (
              <section key={category.id} aria-labelledby={`cat-${category.slug}`}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2
                      id={`cat-${category.slug}`}
                      className="font-instrument-serif text-3xl text-foreground"
                    >
                      {category.nombre}
                    </h2>
                    {category.descripcion && (
                      <p className="mt-1 text-sm text-muted-foreground">{category.descripcion}</p>
                    )}
                  </div>
                  <Link
                    href={`/catalogo/${category.slug}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Ver categoría
                  </Link>
                </div>

                {category.products.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    {catalog.emptyCategory}
                  </p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {category.products.map((product) => (
                      <ProductCard key={product.id} product={product} modo={category.modo} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
