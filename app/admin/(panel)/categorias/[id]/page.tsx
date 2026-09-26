import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CategoryForm } from "@/components/admin/category-form";
import type { Category } from "@/lib/catalog-types";

export const metadata = { title: "Editar categoría" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, nombre, descripcion, orden, modo, activo")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <h1 className="mb-6 font-instrument-serif text-3xl">Editar categoría</h1>
      <CategoryForm category={data as Category} />
    </>
  );
}
