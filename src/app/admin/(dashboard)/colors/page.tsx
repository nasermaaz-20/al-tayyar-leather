import { prisma } from "@/src/server/db/prisma";
import ColorsClient from "./colors-client";

export const dynamic = "force-dynamic";

export default async function ColorsPage() {
  const colors = await prisma.color.findMany({
    orderBy: { nameAr: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Colors</h1>
          <p className="text-muted-foreground mt-1">Manage leather colors for available catalog options.</p>
        </div>
      </div>
      <ColorsClient initialColors={colors} />
    </div>
  );
}
