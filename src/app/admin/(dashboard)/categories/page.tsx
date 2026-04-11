import { prisma } from "@/src/server/db/prisma";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { nameAr: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage product categories for both Arabic and English catalogs.</p>
        </div>
      </div>
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
