import { prisma } from '@/src/server/db/prisma';
import { GalleryService, GalleryImage, UploadGalleryImageDto } from '../gallery.service';

describe('GalleryService', () => {
  let galleryService: GalleryService;

  beforeEach(async () => {
    galleryService = new GalleryService();
    // Clean up gallery images before each test
    await prisma.galleryImage.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('getAll', () => {
    it('should return empty array when no images exist', async () => {
      const images = await galleryService.getAll();

      expect(images).toEqual([]);
    });

    it('should return all gallery images', async () => {
      // Create test images
      await prisma.galleryImage.createMany({
        data: [
          { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
          { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
          { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 2 },
        ],
      });

      const images = await galleryService.getAll();

      expect(images).toHaveLength(3);
      expect(images[0].url).toBe('/uploads/gallery/img1.jpg');
      expect(images[1].url).toBe('/uploads/gallery/img2.jpg');
      expect(images[2].url).toBe('/uploads/gallery/img3.jpg');
    });

    it('should return images ordered by order field ascending', async () => {
      // Create images in random order
      await prisma.galleryImage.createMany({
        data: [
          { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 2 },
          { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
          { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
        ],
      });

      const images = await galleryService.getAll();

      expect(images).toHaveLength(3);
      expect(images[0].order).toBe(0);
      expect(images[1].order).toBe(1);
      expect(images[2].order).toBe(2);
      expect(images[0].url).toBe('/uploads/gallery/img1.jpg');
    });

    it('should include all image fields', async () => {
      await prisma.galleryImage.create({
        data: {
          url: '/uploads/gallery/test.jpg',
          alt: 'Test Image',
          order: 0,
        },
      });

      const images = await galleryService.getAll();

      expect(images[0]).toHaveProperty('id');
      expect(images[0]).toHaveProperty('url');
      expect(images[0]).toHaveProperty('alt');
      expect(images[0]).toHaveProperty('order');
      expect(images[0]).toHaveProperty('createdAt');
      expect(images[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('upload', () => {
    it('should create a new gallery image with order 0 when no images exist', async () => {
      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/new-image.jpg',
        alt: 'New Image',
      };

      const image = await galleryService.upload(data);

      expect(image.url).toBe(data.url);
      expect(image.alt).toBe(data.alt);
      expect(image.order).toBe(0);
      expect(image).toHaveProperty('id');
      expect(image).toHaveProperty('createdAt');
    });

    it('should assign next order value when images exist', async () => {
      // Create existing images
      await prisma.galleryImage.createMany({
        data: [
          { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
          { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
        ],
      });

      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/img3.jpg',
        alt: 'Image 3',
      };

      const image = await galleryService.upload(data);

      expect(image.order).toBe(2);
    });

    it('should handle non-sequential order values correctly', async () => {
      // Create images with gaps in order
      await prisma.galleryImage.createMany({
        data: [
          { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
          { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 5 },
          { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 10 },
        ],
      });

      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/img4.jpg',
        alt: 'Image 4',
      };

      const image = await galleryService.upload(data);

      // Should be max + 1 = 11
      expect(image.order).toBe(11);
    });

    it('should persist the image immediately', async () => {
      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/test.jpg',
        alt: 'Test',
      };

      const created = await galleryService.upload(data);

      // Verify by fetching from database
      const retrieved = await prisma.galleryImage.findUnique({
        where: { id: created.id },
      });

      expect(retrieved).not.toBeNull();
      expect(retrieved?.url).toBe(data.url);
      expect(retrieved?.alt).toBe(data.alt);
    });

    it('should handle Arabic alt text', async () => {
      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/arabic.jpg',
        alt: 'صورة منتجات جلدية فاخرة',
      };

      const image = await galleryService.upload(data);

      expect(image.alt).toBe('صورة منتجات جلدية فاخرة');
    });

    it('should handle special characters in URL', async () => {
      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/image-with-special_chars (1).jpg',
        alt: 'Special chars',
      };

      const image = await galleryService.upload(data);

      expect(image.url).toBe(data.url);
    });
  });

  describe('delete', () => {
    it('should delete an existing gallery image', async () => {
      const created = await prisma.galleryImage.create({
        data: {
          url: '/uploads/gallery/to-delete.jpg',
          alt: 'To Delete',
          order: 0,
        },
      });

      await galleryService.delete(created.id);

      const retrieved = await prisma.galleryImage.findUnique({
        where: { id: created.id },
      });

      expect(retrieved).toBeNull();
    });

    it('should throw error when deleting non-existent image', async () => {
      await expect(galleryService.delete('non-existent-id')).rejects.toThrow();
    });

    it('should not affect other images when deleting one', async () => {
      const images = await prisma.galleryImage.createMany({
        data: [
          { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
          { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
          { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 2 },
        ],
      });

      const allImages = await prisma.galleryImage.findMany();
      const toDelete = allImages[1];

      await galleryService.delete(toDelete.id);

      const remaining = await galleryService.getAll();
      expect(remaining).toHaveLength(2);
      expect(remaining.find((img) => img.id === toDelete.id)).toBeUndefined();
    });

    it('should immediately remove image from public gallery', async () => {
      const created = await prisma.galleryImage.create({
        data: {
          url: '/uploads/gallery/test.jpg',
          alt: 'Test',
          order: 0,
        },
      });

      await galleryService.delete(created.id);

      // Verify it's not in getAll results
      const images = await galleryService.getAll();
      expect(images.find((img) => img.id === created.id)).toBeUndefined();
    });
  });

  describe('reorder', () => {
    it('should update order of all provided images', async () => {
      // Create images
      const img1 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
      });
      const img2 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
      });
      const img3 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 2 },
      });

      // Reorder: img3, img1, img2
      await galleryService.reorder([img3.id, img1.id, img2.id]);

      const images = await galleryService.getAll();

      expect(images[0].id).toBe(img3.id);
      expect(images[0].order).toBe(0);
      expect(images[1].id).toBe(img1.id);
      expect(images[1].order).toBe(1);
      expect(images[2].id).toBe(img2.id);
      expect(images[2].order).toBe(2);
    });

    it('should handle single image reorder', async () => {
      const img = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img.jpg', alt: 'Image', order: 5 },
      });

      await galleryService.reorder([img.id]);

      const retrieved = await prisma.galleryImage.findUnique({
        where: { id: img.id },
      });

      expect(retrieved?.order).toBe(0);
    });

    it('should handle reverse order', async () => {
      const img1 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
      });
      const img2 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
      });
      const img3 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 2 },
      });

      // Reverse order
      await galleryService.reorder([img3.id, img2.id, img1.id]);

      const images = await galleryService.getAll();

      expect(images[0].id).toBe(img3.id);
      expect(images[1].id).toBe(img2.id);
      expect(images[2].id).toBe(img1.id);
    });

    it('should persist order changes immediately', async () => {
      const img1 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
      });
      const img2 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
      });

      await galleryService.reorder([img2.id, img1.id]);

      // Fetch directly from database to verify persistence
      const retrieved1 = await prisma.galleryImage.findUnique({
        where: { id: img1.id },
      });
      const retrieved2 = await prisma.galleryImage.findUnique({
        where: { id: img2.id },
      });

      expect(retrieved2?.order).toBe(0);
      expect(retrieved1?.order).toBe(1);
    });

    it('should throw error when reordering non-existent image', async () => {
      await expect(
        galleryService.reorder(['non-existent-id'])
      ).rejects.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(galleryService.reorder([])).resolves.not.toThrow();
    });

    it('should handle partial reorder (subset of images)', async () => {
      const img1 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img1.jpg', alt: 'Image 1', order: 0 },
      });
      const img2 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img2.jpg', alt: 'Image 2', order: 1 },
      });
      const img3 = await prisma.galleryImage.create({
        data: { url: '/uploads/gallery/img3.jpg', alt: 'Image 3', order: 2 },
      });

      // Only reorder img1 and img3
      await galleryService.reorder([img3.id, img1.id]);

      const retrieved1 = await prisma.galleryImage.findUnique({
        where: { id: img1.id },
      });
      const retrieved2 = await prisma.galleryImage.findUnique({
        where: { id: img2.id },
      });
      const retrieved3 = await prisma.galleryImage.findUnique({
        where: { id: img3.id },
      });

      expect(retrieved3?.order).toBe(0);
      expect(retrieved1?.order).toBe(1);
      expect(retrieved2?.order).toBe(1); // Unchanged
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent uploads correctly', async () => {
      const data1: UploadGalleryImageDto = {
        url: '/uploads/gallery/concurrent1.jpg',
        alt: 'Concurrent 1',
      };
      const data2: UploadGalleryImageDto = {
        url: '/uploads/gallery/concurrent2.jpg',
        alt: 'Concurrent 2',
      };

      const [img1, img2] = await Promise.all([
        galleryService.upload(data1),
        galleryService.upload(data2),
      ]);

      // Both should be created successfully
      expect(img1).toHaveProperty('id');
      expect(img2).toHaveProperty('id');
      expect(img1.id).not.toBe(img2.id);

      const allImages = await galleryService.getAll();
      expect(allImages).toHaveLength(2);
    });

    it('should handle very long alt text', async () => {
      const longAlt = 'A'.repeat(1000);
      const data: UploadGalleryImageDto = {
        url: '/uploads/gallery/long-alt.jpg',
        alt: longAlt,
      };

      const image = await galleryService.upload(data);

      expect(image.alt).toBe(longAlt);
      expect(image.alt.length).toBe(1000);
    });

    it('should handle very long URL', async () => {
      const longUrl = '/uploads/gallery/' + 'a'.repeat(500) + '.jpg';
      const data: UploadGalleryImageDto = {
        url: longUrl,
        alt: 'Long URL',
      };

      const image = await galleryService.upload(data);

      expect(image.url).toBe(longUrl);
    });

    it('should handle large number of images', async () => {
      // Create 100 images
      const images = Array.from({ length: 100 }, (_, i) => ({
        url: `/uploads/gallery/img${i}.jpg`,
        alt: `Image ${i}`,
        order: i,
      }));

      await prisma.galleryImage.createMany({ data: images });

      const allImages = await galleryService.getAll();

      expect(allImages).toHaveLength(100);
      expect(allImages[0].order).toBe(0);
      expect(allImages[99].order).toBe(99);
    });

    it('should handle reordering large number of images', async () => {
      // Create 50 images
      const images = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          prisma.galleryImage.create({
            data: {
              url: `/uploads/gallery/img${i}.jpg`,
              alt: `Image ${i}`,
              order: i,
            },
          })
        )
      );

      // Reverse order
      const reversedIds = images.map((img: GalleryImage) => img.id).reverse();
      await galleryService.reorder(reversedIds);

      const reordered = await galleryService.getAll();

      expect(reordered[0].id).toBe(images[49].id);
      expect(reordered[49].id).toBe(images[0].id);
    });
  });
});
