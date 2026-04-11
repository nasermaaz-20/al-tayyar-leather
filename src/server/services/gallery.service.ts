import { prisma } from '@/src/server/db/prisma';

/**
 * Gallery image interface
 */
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  createdAt: Date;
}

/**
 * Data for uploading a new gallery image
 */
export interface UploadGalleryImageDto {
  url: string;
  alt: string;
}

/**
 * GalleryService handles gallery image management
 * Manages image ordering for gallery display
 */
export class GalleryService {
  /**
   * Get all gallery images ordered by the order field
   * @returns Array of gallery images sorted by order
   */
  async getAll(): Promise<GalleryImage[]> {
    const images = await prisma.galleryImage.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return images;
  }

  /**
   * Upload a new gallery image
   * Automatically assigns the next order value
   * @param data Image data (url and alt text)
   * @returns Created gallery image
   */
  async upload(data: UploadGalleryImageDto): Promise<GalleryImage> {
    // Get the current maximum order value
    const maxOrderImage = await prisma.galleryImage.findFirst({
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    // Assign next order value (max + 1, or 0 if no images exist)
    const nextOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    const image = await prisma.galleryImage.create({
      data: {
        url: data.url,
        alt: data.alt,
        order: nextOrder,
      },
    });

    return image;
  }

  /**
   * Delete a gallery image by ID
   * @param id Gallery image ID
   */
  async delete(id: string): Promise<void> {
    await prisma.galleryImage.delete({
      where: { id },
    });
  }

  /**
   * Reorder gallery images
   * Updates the order field for all provided image IDs
   * @param imageIds Array of image IDs in the desired order
   */
  async reorder(imageIds: string[]): Promise<void> {
    // Update each image with its new order position
    await Promise.all(
      imageIds.map((id, index) =>
        prisma.galleryImage.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }
}

// Export singleton instance
export const galleryService = new GalleryService();
