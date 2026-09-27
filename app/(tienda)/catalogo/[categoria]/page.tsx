import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import { ProductCard } from "@/components/store/product-card";
import { CatalogUnavailable } from "@/components/store/catalog-unavailable";

export const revalidate = 60;

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const result = await getCatalog();
  const category =
    result.status === "ok" ? result.categories.find((c) => c.slug === categoria) : null;

  if (!category) return { title: "Catálogo" };
  return {
    title: category.nombre,
    description: category.descripcion ?? siteConfig.catalog.description,
    alternates: { canonical: `/catalogo/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const { catalog } = siteConfig;
  const result = await getCatalog();

  if (result.status === "unavailable") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <CatalogUnavailable />
      </div>
    );
  }

  const category = result.categories.find((c) => c.slug === categoria);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/catalogo"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {catalog.allCategories}
      </Link>

      <div className="mb-10 max-w-2xl">
        <h1 className="font-instrument-serif text-4xl text-foreground sm:text-5xl">
          {category.nombre}
        </h1>
        {category.descripcion && (
          <p className="mt-3 text-muted-foreground">{category.descripcion}</p>
        )}
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
    </div>
  );
}
