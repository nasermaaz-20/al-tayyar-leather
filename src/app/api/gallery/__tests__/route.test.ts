import { GET } from '../route';
import { galleryService } from '@/src/server/services/gallery.service';

// Mock the gallery service
jest.mock('@/src/server/services/gallery.service', () => ({
  galleryService: {
    getAll: jest.fn(),
  },
}));

describe('GET /api/gallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all gallery images ordered by order field', async () => {
    // Arrange
    const mockImages = [
      {
        id: '1',
        url: '/uploads/gallery/image1.jpg',
        alt: 'Gallery Image 1',
        order: 0,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        url: '/uploads/gallery/image2.jpg',
        alt: 'Gallery Image 2',
        order: 1,
        createdAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        url: '/uploads/gallery/image3.jpg',
        alt: 'Gallery Image 3',
        order: 2,
        createdAt: new Date('2024-01-03'),
      },
    ];

    (galleryService.getAll as jest.Mock).mockResolvedValue(mockImages);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data[0].id).toBe('1');
    expect(data.data[0].url).toBe('/uploads/gallery/image1.jpg');
    expect(data.data[0].alt).toBe('Gallery Image 1');
    expect(data.data[0].order).toBe(0);
    expect(data.data[1].id).toBe('2');
    expect(data.data[2].id).toBe('3');
    expect(galleryService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no gallery images exist', async () => {
    // Arrange
    (galleryService.getAll as jest.Mock).mockResolvedValue([]);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(galleryService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return 500 error when service throws an error', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    (galleryService.getAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch gallery images',
    });
    expect(galleryService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return images in the correct order', async () => {
    // Arrange - Images with specific order values
    const mockImages = [
      {
        id: '1',
        url: '/uploads/gallery/image1.jpg',
        alt: 'First Image',
        order: 0,
        createdAt: new Date('2024-01-03'),
      },
      {
        id: '2',
        url: '/uploads/gallery/image2.jpg',
        alt: 'Second Image',
        order: 1,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        url: '/uploads/gallery/image3.jpg',
        alt: 'Third Image',
        order: 2,
        createdAt: new Date('2024-01-02'),
      },
    ];

    (galleryService.getAll as jest.Mock).mockResolvedValue(mockImages);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.data[0].order).toBe(0);
    expect(data.data[1].order).toBe(1);
    expect(data.data[2].order).toBe(2);
    // Verify order is ascending
    for (let i = 1; i < data.data.length; i++) {
      expect(data.data[i].order).toBeGreaterThan(data.data[i - 1].order);
    }
  });
});
