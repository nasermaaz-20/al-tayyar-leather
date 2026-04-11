import { prisma } from "@/src/server/db/prisma";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Manage the images that appear in your public luxury gallery.
          </p>
        </div>
      </div>
      <GalleryClient initialImages={images} />
    </div>
  );
}
