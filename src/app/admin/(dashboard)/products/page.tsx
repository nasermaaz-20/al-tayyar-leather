import { prisma } from "@/src/server/db/prisma";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      categories: { include: { category: true } },
      colors: { include: { color: true } },
      images: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform complex relations for easier client usage
  const transformedProducts = products.map(p => ({
    ...p,
    price: p.price ? Number(p.price) : null,
    categories: p.categories.map(c => c.category),
    colors: p.colors.map(c => c.color),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your luxury leather products catalog.</p>
        </div>
      </div>
      <ProductsClient initialProducts={transformedProducts} />
    </div>
  );
}
