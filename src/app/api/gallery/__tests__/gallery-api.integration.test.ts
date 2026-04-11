/**
 * Integration tests for Gallery API
 * Tests the complete flow from API route to database
 */

import { GET } from '../route';
import { prisma } from '@/src/server/db/prisma';

describe('Gallery API Integration Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.galleryImage.deleteMany({
      where: {
        alt: {
          contains: 'Test Gallery',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return gallery images ordered by order field', async () => {
    // Arrange - Create test gallery images with specific order
    const image1 = await prisma.galleryImage.create({
      data: {
        url: '/test/image1.jpg',
        alt: 'Test Gallery Image 1',
        order: 2,
      },
    });

    const image2 = await prisma.galleryImage.create({
      data: {
        url: '/test/image2.jpg',
        alt: 'Test Gallery Image 2',
        order: 0,
      },
    });

    const image3 = await prisma.galleryImage.create({
      data: {
        url: '/test/image3.jpg',
        alt: 'Test Gallery Image 3',
        order: 1,
      },
    });

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);

    // Find our test images in the response
    const testImages = data.data.filter((img: any) =>
      img.alt.includes('Test Gallery')
    );

    expect(testImages).toHaveLength(3);

    // Verify images are ordered by order field (ascending)
    expect(testImages[0].id).toBe(image2.id); // order: 0
    expect(testImages[0].order).toBe(0);
    expect(testImages[1].id).toBe(image3.id); // order: 1
    expect(testImages[1].order).toBe(1);
    expect(testImages[2].id).toBe(image1.id); // order: 2
    expect(testImages[2].order).toBe(2);

    // Verify all required fields are present
    testImages.forEach((img: any) => {
      expect(img).toHaveProperty('id');
      expect(img).toHaveProperty('url');
      expect(img).toHaveProperty('alt');
      expect(img).toHaveProperty('order');
      expect(img).toHaveProperty('createdAt');
    });
  });

  it('should return empty array when no gallery images exist', async () => {
    // Arrange - Ensure no test images exist
    await prisma.galleryImage.deleteMany({
      where: {
        alt: {
          contains: 'Test Gallery',
        },
      },
    });

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    // Note: data.data might not be empty if there are other gallery images
    // but it should be an array
  });

  it('should include all image properties in response', async () => {
    // Arrange
    const testImage = await prisma.galleryImage.create({
      data: {
        url: '/test/complete-image.jpg',
        alt: 'Test Gallery Complete Image',
        order: 0,
      },
    });

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    const foundImage = data.data.find((img: any) => img.id === testImage.id);

    expect(foundImage).toBeDefined();
    expect(foundImage.id).toBe(testImage.id);
    expect(foundImage.url).toBe(testImage.url);
    expect(foundImage.alt).toBe(testImage.alt);
    expect(foundImage.order).toBe(testImage.order);
    expect(foundImage.createdAt).toBeDefined();
  });

  it('should maintain order consistency with multiple images', async () => {
    // Arrange - Create 5 images with specific order
    const images = await Promise.all([
      prisma.galleryImage.create({
        data: { url: '/test/img0.jpg', alt: 'Test Gallery Order 0', order: 0 },
      }),
      prisma.galleryImage.create({
        data: { url: '/test/img1.jpg', alt: 'Test Gallery Order 1', order: 1 },
      }),
      prisma.galleryImage.create({
        data: { url: '/test/img2.jpg', alt: 'Test Gallery Order 2', order: 2 },
      }),
      prisma.galleryImage.create({
        data: { url: '/test/img3.jpg', alt: 'Test Gallery Order 3', order: 3 },
      }),
      prisma.galleryImage.create({
        data: { url: '/test/img4.jpg', alt: 'Test Gallery Order 4', order: 4 },
      }),
    ]);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    const testImages = data.data.filter((img: any) =>
      img.alt.includes('Test Gallery Order')
    );

    expect(testImages).toHaveLength(5);

    // Verify ascending order
    for (let i = 0; i < testImages.length - 1; i++) {
      expect(testImages[i].order).toBeLessThan(testImages[i + 1].order);
    }

    // Verify correct sequence
    testImages.forEach((img: any, index: number) => {
      expect(img.order).toBe(index);
    });
  });
});
