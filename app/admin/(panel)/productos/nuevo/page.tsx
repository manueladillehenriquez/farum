import { requireAdmin } from "@/lib/auth/require-admin";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, nombre, modo")
    .order("orden");

  return (
    <>
      <h1 className="mb-6 font-instrument-serif text-3xl">Nuevo producto</h1>
      <ProductForm categories={categories ?? []} />
    </>
  );
}
