import { ProductService } from '../product.service';
import { prisma } from '@/src/server/db/prisma';

// Mock Prisma client
jest.mock('@/src/server/db/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product with all required fields', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        images: [],
        colors: [],
        categories: [
          {
            category: {
              id: 'cat_1',
              nameAr: 'حقائب',
              nameEn: 'Bags',
              slug: 'bags',
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.create({
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        categoryIds: ['cat_1'],
      });

      expect(result.nameAr).toBe('حقيبة جلدية');
      expect(result.nameEn).toBe('Leather Bag');
      expect(prisma.product.create).toHaveBeenCalled();
    });

    it('should reject product creation without Arabic name', async () => {
      await expect(
        productService.create({
          nameAr: '',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية',
          descEn: 'Leather bag',
          categoryIds: ['cat_1'],
        })
      ).rejects.toThrow('Arabic name is required');
    });

    it('should reject product creation without English name', async () => {
      await expect(
        productService.create({
          nameAr: 'حقيبة جلدية',
          nameEn: '',
          descAr: 'حقيبة جلدية',
          descEn: 'Leather bag',
          categoryIds: ['cat_1'],
        })
      ).rejects.toThrow('English name is required');
    });

    it('should reject product creation without Arabic description', async () => {
      await expect(
        productService.create({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: '',
          descEn: 'Leather bag',
          categoryIds: ['cat_1'],
        })
      ).rejects.toThrow('Arabic description is required');
    });

    it('should reject product creation without English description', async () => {
      await expect(
        productService.create({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية',
          descEn: '',
          categoryIds: ['cat_1'],
        })
      ).rejects.toThrow('English description is required');
    });

    it('should reject product creation without categories', async () => {
      await expect(
        productService.create({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: [],
        })
      ).rejects.toThrow('At least one category must be selected');
    });

    it('should create product with optional price', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: null,
        slug: 'leather-bag',
        images: [],
        colors: [],
        categories: [
          {
            category: {
              id: 'cat_1',
              nameAr: 'حقائب',
              nameEn: 'Bags',
              slug: 'bags',
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.create({
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        categoryIds: ['cat_1'],
      });

      expect(result.price).toBeNull();
    });

    it('should create product with multiple images', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        images: [
          { id: 'img_1', url: '/img1.jpg', alt: 'Image 1', order: 0 },
          { id: 'img_2', url: '/img2.jpg', alt: 'Image 2', order: 1 },
        ],
        colors: [],
        categories: [
          {
            category: {
              id: 'cat_1',
              nameAr: 'حقائب',
              nameEn: 'Bags',
              slug: 'bags',
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.create({
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        categoryIds: ['cat_1'],
        images: [
          { url: '/img1.jpg', alt: 'Image 1', order: 0 },
          { url: '/img2.jpg', alt: 'Image 2', order: 1 },
        ],
      });

      expect(result.images).toHaveLength(2);
      expect(result.images[0].order).toBe(0);
      expect(result.images[1].order).toBe(1);
    });

    it('should create product with multiple colors', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        images: [],
        colors: [
          {
            color: {
              id: 'color_1',
              nameAr: 'أسود',
              nameEn: 'Black',
              hexCode: '#000000',
            },
          },
          {
            color: {
              id: 'color_2',
              nameAr: 'بني',
              nameEn: 'Brown',
              hexCode: '#8B4513',
            },
          },
        ],
        categories: [
          {
            category: {
              id: 'cat_1',
              nameAr: 'حقائب',
              nameEn: 'Bags',
              slug: 'bags',
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.create({
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        categoryIds: ['cat_1'],
        colorIds: ['color_1', 'color_2'],
      });

      expect(result.colors).toHaveLength(2);
      expect(result.colors[0].nameEn).toBe('Black');
      expect(result.colors[1].nameEn).toBe('Brown');
    });
  });

  describe('getAll', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [
        {
          id: 'prod_1',
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          price: 100,
          slug: 'leather-bag',
          images: [],
          colors: [],
          categories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll();

      expect(result).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: 'prod_1',
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          price: 100,
          slug: 'leather-bag',
          images: [],
          colors: [],
          categories: [
            {
              category: {
                id: 'cat_1',
                nameAr: 'حقائب',
                nameEn: 'Bags',
                slug: 'bags',
              },
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({ categoryIds: ['cat_1'] });

      expect(result).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: {
              some: {
                categoryId: {
                  in: ['cat_1'],
                },
              },
            },
          }),
        })
      );
    });

    it('should filter products by color', async () => {
      const mockProducts = [
        {
          id: 'prod_1',
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          price: 100,
          slug: 'leather-bag',
          images: [],
          colors: [
            {
              color: {
                id: 'color_1',
                nameAr: 'أسود',
                nameEn: 'Black',
                hexCode: '#000000',
              },
            },
          ],
          categories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({ colorIds: ['color_1'] });

      expect(result).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            colors: {
              some: {
                colorId: {
                  in: ['color_1'],
                },
              },
            },
          }),
        })
      );
    });

    it('should filter products by search query', async () => {
      const mockProducts = [
        {
          id: 'prod_1',
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          price: 100,
          slug: 'leather-bag',
          images: [],
          colors: [],
          categories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({ searchQuery: 'leather' });

      expect(result).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ nameAr: expect.any(Object) }),
              expect.objectContaining({ nameEn: expect.any(Object) }),
            ]),
          }),
        })
      );
    });
  });

  describe('getBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        images: [],
        colors: [],
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getBySlug('leather-bag');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('leather-bag');
    });

    it('should return null for non-existent slug', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await productService.getBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        images: [],
        colors: [],
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getById('prod_1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('prod_1');
    });

    it('should return null for non-existent ID', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await productService.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const existingProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = {
        ...existingProduct,
        price: 150,
        images: [],
        colors: [],
        categories: [],
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(existingProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await productService.update('prod_1', { price: 150 });

      expect(result.price).toBe(150);
      expect(prisma.product.update).toHaveBeenCalled();
    });

    it('should throw error when updating non-existent product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        productService.update('non-existent', { price: 150 })
      ).rejects.toThrow('Product not found');
    });

    it('should reject empty Arabic name', async () => {
      const existingProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(existingProduct);

      await expect(
        productService.update('prod_1', { nameAr: '' })
      ).rejects.toThrow('Arabic name cannot be empty');
    });

    it('should reject empty category list', async () => {
      const existingProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(existingProduct);

      await expect(
        productService.update('prod_1', { categoryIds: [] })
      ).rejects.toThrow('At least one category must be selected');
    });
  });

  describe('delete', () => {
    it('should delete existing product', async () => {
      const existingProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 100,
        slug: 'leather-bag',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(existingProduct);
      (prisma.product.delete as jest.Mock).mockResolvedValue(existingProduct);

      await productService.delete('prod_1');

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
      });
    });

    it('should throw error when deleting non-existent product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(productService.delete('non-existent')).rejects.toThrow(
        'Product not found'
      );
    });
  });
});
