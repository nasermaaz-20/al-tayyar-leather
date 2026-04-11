import { prisma } from "@/src/server/db/prisma";
import { ProductForm } from "@/src/features/products/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // Fetch required reference data for the form
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
  });

  const colors = await prisma.color.findMany({
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="pb-10">
      <ProductForm categories={categories} colors={colors} />
    </div>
  );
}
