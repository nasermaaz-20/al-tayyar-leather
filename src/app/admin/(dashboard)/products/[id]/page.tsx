import { prisma } from "@/src/server/db/prisma";
import { ProductForm } from "@/src/features/products/components/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [product, categories, colors] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        categories: { include: { category: true } },
        colors: { include: { color: true } },
        images: { orderBy: { order: 'asc' } }
      }
    }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.color.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  // Flatten the relations to match what the form expects
  const formattedProduct = {
    ...product,
    categories: product.categories.map(c => c.category),
    colors: product.colors.map(c => c.color),
  };

  return (
    <div className="pb-10">
      <ProductForm
        initialData={formattedProduct}
        categories={categories}
        colors={colors}
      />
    </div>
  );
}