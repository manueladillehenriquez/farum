import { requireAdmin } from "@/lib/auth/require-admin";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Nueva categoría" };

export default async function NewCategoryPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-6 font-instrument-serif text-3xl">Nueva categoría</h1>
      <CategoryForm />
    </>
  );
}
