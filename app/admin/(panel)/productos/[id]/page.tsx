import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/lib/catalog-types";

export const metadata = { title: "Editar producto" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, category_id, nombre, descripcion, precio, sku, imagen_url, activo, estado, stock")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, nombre, modo").order("orden"),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="mb-6 font-instrument-serif text-3xl">Editar producto</h1>
      <ProductForm product={product as Product} categories={categories ?? []} />
    </>
  );
}
