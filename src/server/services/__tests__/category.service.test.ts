import { CategoryService } from '../category.service';
import { prisma } from '@/src/server/db/prisma';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
  });

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a category with bilingual names', async () => {
      const data = {
        nameAr: 'حقائب',
        nameEn: 'Bags',
      };

      const category = await categoryService.create(data);

      expect(category).toBeDefined();
      expect(category.nameAr).toBe('حقائب');
      expect(category.nameEn).toBe('Bags');
      expect(category.slug).toBe('bags');
    });

    it('should generate unique slugs for duplicate names', async () => {
      const data1 = { nameAr: 'حقائب', nameEn: 'Bags' };
      const data2 = { nameAr: 'حقائب أخرى', nameEn: 'Bags' };

      const category1 = await categoryService.create(data1);
      const category2 = await categoryService.create(data2);

      expect(category1.slug).toBe('bags');
      expect(category2.slug).toBe('bags-1');
    });

    it('should throw error if Arabic name is missing', async () => {
      const data = {
        nameAr: '',
        nameEn: 'Bags',
      };

      await expect(categoryService.create(data)).rejects.toThrow(
        'Arabic name is required'
      );
    });

    it('should throw error if English name is missing', async () => {
      const data = {
        nameAr: 'حقائب',
        nameEn: '',
      };

      await expect(categoryService.create(data)).rejects.toThrow(
        'English name is required'
      );
    });
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      await categoryService.create({ nameAr: 'حقائب', nameEn: 'Bags' });
      await categoryService.create({ nameAr: 'محافظ', nameEn: 'Wallets' });

      const categories = await categoryService.getAll();

      expect(categories).toHaveLength(2);
      expect(categories[0].nameEn).toBe('Bags');
      expect(categories[1].nameEn).toBe('Wallets');
    });

    it('should return empty array when no categories exist', async () => {
      const categories = await categoryService.getAll();

      expect(categories).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return a category by ID', async () => {
      const created = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      const category = await categoryService.getById(created.id);

      expect(category).toBeDefined();
      expect(category?.id).toBe(created.id);
      expect(category?.nameAr).toBe('حقائب');
      expect(category?.nameEn).toBe('Bags');
    });

    it('should return null for non-existent ID', async () => {
      const category = await categoryService.getById('non-existent-id');

      expect(category).toBeNull();
    });
  });

  describe('update', () => {
    it('should update category names', async () => {
      const created = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      const updated = await categoryService.update(created.id, {
        nameAr: 'حقائب جلدية',
        nameEn: 'Leather Bags',
      });

      expect(updated.nameAr).toBe('حقائب جلدية');
      expect(updated.nameEn).toBe('Leather Bags');
      expect(updated.slug).toBe('leather-bags');
    });

    it('should update only Arabic name', async () => {
      const created = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      const updated = await categoryService.update(created.id, {
        nameAr: 'حقائب جلدية',
      });

      expect(updated.nameAr).toBe('حقائب جلدية');
      expect(updated.nameEn).toBe('Bags');
      expect(updated.slug).toBe('bags');
    });

    it('should throw error for non-existent category', async () => {
      await expect(
        categoryService.update('non-existent-id', { nameAr: 'test' })
      ).rejects.toThrow('Category not found');
    });

    it('should throw error if Arabic name is empty', async () => {
      const created = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      await expect(
        categoryService.update(created.id, { nameAr: '' })
      ).rejects.toThrow('Arabic name cannot be empty');
    });

    it('should throw error if English name is empty', async () => {
      const created = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      await expect(
        categoryService.update(created.id, { nameEn: '' })
      ).rejects.toThrow('English name cannot be empty');
    });
  });

  describe('delete', () => {
    it('should delete a category without products', async () => {
      const created = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      await categoryService.delete(created.id);

      const category = await categoryService.getById(created.id);
      expect(category).toBeNull();
    });

    it('should throw error when deleting non-existent category', async () => {
      await expect(categoryService.delete('non-existent-id')).rejects.toThrow(
        'Category not found'
      );
    });

    it('should throw error when category has associated products', async () => {
      // Create category
      const category = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      // Create a product with this category
      await prisma.product.create({
        data: {
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          slug: 'leather-bag-delete-test',
          categories: {
            create: {
              categoryId: category.id,
            },
          },
        },
      });

      // Attempt to delete category should fail
      await expect(categoryService.delete(category.id)).rejects.toThrow(
        'Cannot delete category because it has associated products'
      );

      // Verify category still exists
      const stillExists = await categoryService.getById(category.id);
      expect(stillExists).not.toBeNull();
    });
  });

  describe('hasProducts', () => {
    it('should return false for category without products', async () => {
      const category = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      const hasProducts = await categoryService.hasProducts(category.id);

      expect(hasProducts).toBe(false);
    });

    it('should return true for category with products', async () => {
      // Create category
      const category = await categoryService.create({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });

      // Create a product with this category
      await prisma.product.create({
        data: {
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          slug: 'leather-bag-test-2',
          categories: {
            create: {
              categoryId: category.id,
            },
          },
        },
      });

      const hasProducts = await categoryService.hasProducts(category.id);

      expect(hasProducts).toBe(true);
    });
  });
});
