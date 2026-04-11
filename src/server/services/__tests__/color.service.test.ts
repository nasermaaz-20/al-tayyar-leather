import { ColorService } from '../color.service';
import { prisma } from '@/src/server/db/prisma';

describe('ColorService', () => {
  let colorService: ColorService;

  beforeEach(() => {
    colorService = new ColorService();
  });

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.productColor.deleteMany();
    await prisma.product.deleteMany();
    await prisma.color.deleteMany();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.productColor.deleteMany();
    await prisma.product.deleteMany();
    await prisma.color.deleteMany();
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.productColor.deleteMany();
    await prisma.product.deleteMany();
    await prisma.color.deleteMany();
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a color with bilingual names and hex code', async () => {
      const data = {
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      };

      const color = await colorService.create(data);

      expect(color).toBeDefined();
      expect(color.nameAr).toBe('أسود');
      expect(color.nameEn).toBe('Black');
      expect(color.hexCode).toBe('#000000');
    });

    it('should accept 3-digit hex code', async () => {
      const data = {
        nameAr: 'أحمر',
        nameEn: 'Red',
        hexCode: '#F00',
      };

      const color = await colorService.create(data);

      expect(color.hexCode).toBe('#F00');
    });

    it('should accept 8-digit hex code with alpha', async () => {
      const data = {
        nameAr: 'أزرق شفاف',
        nameEn: 'Transparent Blue',
        hexCode: '#0000FF80',
      };

      const color = await colorService.create(data);

      expect(color.hexCode).toBe('#0000FF80');
    });

    it('should throw error if Arabic name is missing', async () => {
      const data = {
        nameAr: '',
        nameEn: 'Black',
        hexCode: '#000000',
      };

      await expect(colorService.create(data)).rejects.toThrow(
        'Arabic name is required'
      );
    });

    it('should throw error if English name is missing', async () => {
      const data = {
        nameAr: 'أسود',
        nameEn: '',
        hexCode: '#000000',
      };

      await expect(colorService.create(data)).rejects.toThrow(
        'English name is required'
      );
    });

    it('should throw error if hex code is missing', async () => {
      const data = {
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '',
      };

      await expect(colorService.create(data)).rejects.toThrow(
        'Hex code is required'
      );
    });

    it('should throw error for invalid hex code format', async () => {
      const data = {
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: 'invalid',
      };

      await expect(colorService.create(data)).rejects.toThrow(
        'Invalid hex code format'
      );
    });

    it('should throw error for hex code without hash', async () => {
      const data = {
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '000000',
      };

      await expect(colorService.create(data)).rejects.toThrow(
        'Invalid hex code format'
      );
    });

    it('should throw error for invalid hex code length', async () => {
      const data = {
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#00',
      };

      await expect(colorService.create(data)).rejects.toThrow(
        'Invalid hex code format'
      );
    });
  });

  describe('getAll', () => {
    it('should return all colors', async () => {
      await colorService.create({ nameAr: 'أسود', nameEn: 'Black', hexCode: '#000000' });
      await colorService.create({ nameAr: 'أبيض', nameEn: 'White', hexCode: '#FFFFFF' });

      const colors = await colorService.getAll();

      expect(colors).toHaveLength(2);
      expect(colors[0].nameEn).toBe('Black');
      expect(colors[1].nameEn).toBe('White');
    });

    it('should return empty array when no colors exist', async () => {
      const colors = await colorService.getAll();

      expect(colors).toEqual([]);
    });

    it('should return colors sorted by English name', async () => {
      await colorService.create({ nameAr: 'أبيض', nameEn: 'White', hexCode: '#FFFFFF' });
      await colorService.create({ nameAr: 'أسود', nameEn: 'Black', hexCode: '#000000' });
      await colorService.create({ nameAr: 'أحمر', nameEn: 'Red', hexCode: '#FF0000' });

      const colors = await colorService.getAll();

      expect(colors[0].nameEn).toBe('Black');
      expect(colors[1].nameEn).toBe('Red');
      expect(colors[2].nameEn).toBe('White');
    });
  });

  describe('getById', () => {
    it('should return a color by ID', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      const color = await colorService.getById(created.id);

      expect(color).toBeDefined();
      expect(color?.id).toBe(created.id);
      expect(color?.nameAr).toBe('أسود');
      expect(color?.nameEn).toBe('Black');
      expect(color?.hexCode).toBe('#000000');
    });

    it('should return null for non-existent ID', async () => {
      const color = await colorService.getById('non-existent-id');

      expect(color).toBeNull();
    });
  });

  describe('update', () => {
    it('should update all color fields', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      const updated = await colorService.update(created.id, {
        nameAr: 'أسود داكن',
        nameEn: 'Dark Black',
        hexCode: '#0A0A0A',
      });

      expect(updated.nameAr).toBe('أسود داكن');
      expect(updated.nameEn).toBe('Dark Black');
      expect(updated.hexCode).toBe('#0A0A0A');
    });

    it('should update only Arabic name', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      const updated = await colorService.update(created.id, {
        nameAr: 'أسود داكن',
      });

      expect(updated.nameAr).toBe('أسود داكن');
      expect(updated.nameEn).toBe('Black');
      expect(updated.hexCode).toBe('#000000');
    });

    it('should update only English name', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      const updated = await colorService.update(created.id, {
        nameEn: 'Dark Black',
      });

      expect(updated.nameAr).toBe('أسود');
      expect(updated.nameEn).toBe('Dark Black');
      expect(updated.hexCode).toBe('#000000');
    });

    it('should update only hex code', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      const updated = await colorService.update(created.id, {
        hexCode: '#0A0A0A',
      });

      expect(updated.nameAr).toBe('أسود');
      expect(updated.nameEn).toBe('Black');
      expect(updated.hexCode).toBe('#0A0A0A');
    });

    it('should throw error for non-existent color', async () => {
      await expect(
        colorService.update('non-existent-id', { nameAr: 'test' })
      ).rejects.toThrow('Color not found');
    });

    it('should throw error if Arabic name is empty', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      await expect(
        colorService.update(created.id, { nameAr: '' })
      ).rejects.toThrow('Arabic name cannot be empty');
    });

    it('should throw error if English name is empty', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      await expect(
        colorService.update(created.id, { nameEn: '' })
      ).rejects.toThrow('English name cannot be empty');
    });

    it('should throw error if hex code is empty', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      await expect(
        colorService.update(created.id, { hexCode: '' })
      ).rejects.toThrow('Hex code cannot be empty');
    });

    it('should throw error for invalid hex code format on update', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      await expect(
        colorService.update(created.id, { hexCode: 'invalid' })
      ).rejects.toThrow('Invalid hex code format');
    });
  });

  describe('delete', () => {
    it('should delete a color not used by products', async () => {
      const created = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      await colorService.delete(created.id);

      const color = await colorService.getById(created.id);
      expect(color).toBeNull();
    });

    it('should throw error when deleting non-existent color', async () => {
      await expect(colorService.delete('non-existent-id')).rejects.toThrow(
        'Color not found'
      );
    });

    it('should throw error when color is used by products', async () => {
      // Create color
      const color = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      // Create a product with this color
      const product = await prisma.product.create({
        data: {
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          slug: 'leather-bag',
          colors: {
            create: {
              colorId: color.id,
            },
          },
        },
      });

      // Attempt to delete color should fail
      await expect(colorService.delete(color.id)).rejects.toThrow(
        'Cannot delete color because it is used by products'
      );

      // Verify color still exists
      const stillExists = await colorService.getById(color.id);
      expect(stillExists).not.toBeNull();
    });
  });

  describe('isUsedByProducts', () => {
    it('should return false for color not used by products', async () => {
      const color = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      const isUsed = await colorService.isUsedByProducts(color.id);

      expect(isUsed).toBe(false);
    });

    it('should return true for color used by products', async () => {
      // Create color
      const color = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      // Create a product with this color
      await prisma.product.create({
        data: {
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          slug: 'leather-bag-test-2',
          colors: {
            create: {
              colorId: color.id,
            },
          },
        },
      });

      const isUsed = await colorService.isUsedByProducts(color.id);

      expect(isUsed).toBe(true);
    });

    it('should return true when color is used by multiple products', async () => {
      // Create color
      const color = await colorService.create({
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      });

      // Create multiple products with this color
      await prisma.product.create({
        data: {
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          slug: 'leather-bag-test-3',
          colors: {
            create: {
              colorId: color.id,
            },
          },
        },
      });

      await prisma.product.create({
        data: {
          nameAr: 'محفظة جلدية',
          nameEn: 'Leather Wallet',
          descAr: 'محفظة جلدية فاخرة',
          descEn: 'Premium leather wallet',
          slug: 'leather-wallet-test',
          colors: {
            create: {
              colorId: color.id,
            },
          },
        },
      });

      const isUsed = await colorService.isUsedByProducts(color.id);

      expect(isUsed).toBe(true);
    });
  });
});
