/**
 * @jest-environment node
 */

import fc from 'fast-check';
import { productService } from '../product.service';
import { categoryService } from '../category.service';
import { colorService } from '../color.service';
import { settingsService } from '../settings.service';
import { prisma } from '@/src/server/db/prisma';

/**
 * Custom arbitrary for non-empty strings that won't be empty after trimming
 */
const nonEmptyString = (options: { minLength?: number; maxLength?: number } = {}) =>
  fc
    .string({ minLength: options.minLength || 1, maxLength: options.maxLength || 100 })
    .filter((s) => s.trim().length > 0);

/**
 * Property-Based Tests for Bilingual Data Storage
 * Feature: leather-ecommerce-platform, Property 1: Bilingual Data Storage
 * 
 * **Validates: Requirements 1.1, 2.1, 3.1, 8.3, 10.1**
 * 
 * For any entity (product, category, color, or contact settings) with bilingual fields,
 * when created or updated with both Arabic and English values, both values must be
 * persisted correctly and retrievable independently.
 */
describe('Property 1: Bilingual Data Storage', () => {
  // Clean up database after each test
  afterEach(async () => {
    await prisma.productImage.deleteMany();
    await prisma.productColor.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.color.deleteMany();
    await prisma.settings.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test bilingual data storage for Products
   * Validates: Requirement 1.1 - Products must have nameAr and nameEn
   */
  describe('Product Bilingual Storage', () => {
    it('should store and retrieve bilingual product names and descriptions correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nameAr: nonEmptyString({ maxLength: 100 }),
            nameEn: nonEmptyString({ maxLength: 100 }),
            descAr: nonEmptyString({ maxLength: 500 }),
            descEn: nonEmptyString({ maxLength: 500 }),
          }),
          async (productData) => {
            // Create a category first (required for product)
            const category = await categoryService.create({
              nameAr: 'فئة اختبار',
              nameEn: 'Test Category',
            });

            // Create product with bilingual data
            const created = await productService.create({
              ...productData,
              categoryIds: [category.id],
            });

            // Retrieve the product
            const retrieved = await productService.getById(created.id);

            // Verify both Arabic and English values are stored correctly
            expect(retrieved).not.toBeNull();
            expect(retrieved!.nameAr).toBe(productData.nameAr.trim());
            expect(retrieved!.nameEn).toBe(productData.nameEn.trim());
            expect(retrieved!.descAr).toBe(productData.descAr.trim());
            expect(retrieved!.descEn).toBe(productData.descEn.trim());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update and retrieve bilingual product data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            initialNameAr: nonEmptyString({ maxLength: 100 }),
            initialNameEn: nonEmptyString({ maxLength: 100 }),
            initialDescAr: nonEmptyString({ maxLength: 500 }),
            initialDescEn: nonEmptyString({ maxLength: 500 }),
            updatedNameAr: nonEmptyString({ maxLength: 100 }),
            updatedNameEn: nonEmptyString({ maxLength: 100 }),
            updatedDescAr: nonEmptyString({ maxLength: 500 }),
            updatedDescEn: nonEmptyString({ maxLength: 500 }),
          }),
          async (data) => {
            // Create a category first
            const category = await categoryService.create({
              nameAr: 'فئة اختبار',
              nameEn: 'Test Category',
            });

            // Create initial product
            const created = await productService.create({
              nameAr: data.initialNameAr,
              nameEn: data.initialNameEn,
              descAr: data.initialDescAr,
              descEn: data.initialDescEn,
              categoryIds: [category.id],
            });

            // Update with new bilingual data
            const updated = await productService.update(created.id, {
              nameAr: data.updatedNameAr,
              nameEn: data.updatedNameEn,
              descAr: data.updatedDescAr,
              descEn: data.updatedDescEn,
            });

            // Verify updated values are stored correctly
            expect(updated.nameAr).toBe(data.updatedNameAr.trim());
            expect(updated.nameEn).toBe(data.updatedNameEn.trim());
            expect(updated.descAr).toBe(data.updatedDescAr.trim());
            expect(updated.descEn).toBe(data.updatedDescEn.trim());

            // Retrieve and verify persistence
            const retrieved = await productService.getById(created.id);
            expect(retrieved!.nameAr).toBe(data.updatedNameAr.trim());
            expect(retrieved!.nameEn).toBe(data.updatedNameEn.trim());
            expect(retrieved!.descAr).toBe(data.updatedDescAr.trim());
            expect(retrieved!.descEn).toBe(data.updatedDescEn.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test bilingual data storage for Categories
   * Validates: Requirement 2.1 - Categories must have nameAr and nameEn
   */
  describe('Category Bilingual Storage', () => {
    it('should store and retrieve bilingual category names correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nameAr: nonEmptyString({ maxLength: 100 }),
            nameEn: nonEmptyString({ maxLength: 100 }),
          }),
          async (categoryData) => {
            // Create category with bilingual data
            const created = await categoryService.create(categoryData);

            // Retrieve the category
            const retrieved = await categoryService.getById(created.id);

            // Verify both Arabic and English values are stored correctly
            expect(retrieved).not.toBeNull();
            expect(retrieved!.nameAr).toBe(categoryData.nameAr.trim());
            expect(retrieved!.nameEn).toBe(categoryData.nameEn.trim());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update and retrieve bilingual category data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            initialNameAr: nonEmptyString({ maxLength: 100 }),
            initialNameEn: nonEmptyString({ maxLength: 100 }),
            updatedNameAr: nonEmptyString({ maxLength: 100 }),
            updatedNameEn: nonEmptyString({ maxLength: 100 }),
          }),
          async (data) => {
            // Create initial category
            const created = await categoryService.create({
              nameAr: data.initialNameAr,
              nameEn: data.initialNameEn,
            });

            // Update with new bilingual data
            const updated = await categoryService.update(created.id, {
              nameAr: data.updatedNameAr,
              nameEn: data.updatedNameEn,
            });

            // Verify updated values are stored correctly
            expect(updated.nameAr).toBe(data.updatedNameAr.trim());
            expect(updated.nameEn).toBe(data.updatedNameEn.trim());

            // Retrieve and verify persistence
            const retrieved = await categoryService.getById(created.id);
            expect(retrieved!.nameAr).toBe(data.updatedNameAr.trim());
            expect(retrieved!.nameEn).toBe(data.updatedNameEn.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test bilingual data storage for Colors
   * Validates: Requirement 3.1 - Colors must have nameAr and nameEn
   */
  describe('Color Bilingual Storage', () => {
    it('should store and retrieve bilingual color names correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nameAr: nonEmptyString({ maxLength: 100 }),
            nameEn: nonEmptyString({ maxLength: 100 }),
            hexCode: fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex}`),
          }),
          async (colorData) => {
            // Create color with bilingual data
            const created = await colorService.create(colorData);

            // Retrieve the color
            const retrieved = await colorService.getById(created.id);

            // Verify both Arabic and English values are stored correctly
            expect(retrieved).not.toBeNull();
            expect(retrieved!.nameAr).toBe(colorData.nameAr.trim());
            expect(retrieved!.nameEn).toBe(colorData.nameEn.trim());
            expect(retrieved!.hexCode).toBe(colorData.hexCode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update and retrieve bilingual color data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            initialNameAr: nonEmptyString({ maxLength: 100 }),
            initialNameEn: nonEmptyString({ maxLength: 100 }),
            initialHexCode: fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex}`),
            updatedNameAr: nonEmptyString({ maxLength: 100 }),
            updatedNameEn: nonEmptyString({ maxLength: 100 }),
          }),
          async (data) => {
            // Create initial color
            const created = await colorService.create({
              nameAr: data.initialNameAr,
              nameEn: data.initialNameEn,
              hexCode: data.initialHexCode,
            });

            // Update with new bilingual data
            const updated = await colorService.update(created.id, {
              nameAr: data.updatedNameAr,
              nameEn: data.updatedNameEn,
            });

            // Verify updated values are stored correctly
            expect(updated.nameAr).toBe(data.updatedNameAr.trim());
            expect(updated.nameEn).toBe(data.updatedNameEn.trim());

            // Retrieve and verify persistence
            const retrieved = await colorService.getById(created.id);
            expect(retrieved!.nameAr).toBe(data.updatedNameAr.trim());
            expect(retrieved!.nameEn).toBe(data.updatedNameEn.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test bilingual data storage for Settings
   * Validates: Requirement 8.3 - Settings must have addressAr and addressEn
   */
  describe('Settings Bilingual Storage', () => {
    it('should store and retrieve bilingual address data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            addressAr: nonEmptyString({ maxLength: 200 }),
            addressEn: nonEmptyString({ maxLength: 200 }),
            whatsappNumber: nonEmptyString({ maxLength: 20 }),
            tiktokUrl: fc.webUrl(),
          }),
          async (settingsData) => {
            // Update settings with bilingual address data
            await settingsService.updateContactSettings(settingsData);

            // Retrieve the settings
            const retrieved = await settingsService.getContactSettings();

            // Verify both Arabic and English addresses are stored correctly
            expect(retrieved.addressAr).toBe(settingsData.addressAr);
            expect(retrieved.addressEn).toBe(settingsData.addressEn);
            expect(retrieved.whatsappNumber).toBe(settingsData.whatsappNumber);
            expect(retrieved.tiktokUrl).toBe(settingsData.tiktokUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update and retrieve bilingual address data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            initialAddressAr: nonEmptyString({ maxLength: 200 }),
            initialAddressEn: nonEmptyString({ maxLength: 200 }),
            updatedAddressAr: nonEmptyString({ maxLength: 200 }),
            updatedAddressEn: nonEmptyString({ maxLength: 200 }),
          }),
          async (data) => {
            // Set initial bilingual addresses
            await settingsService.updateContactSettings({
              addressAr: data.initialAddressAr,
              addressEn: data.initialAddressEn,
              whatsappNumber: '+1234567890',
              tiktokUrl: 'https://tiktok.com/@test',
            });

            // Update with new bilingual data
            await settingsService.updateContactSettings({
              addressAr: data.updatedAddressAr,
              addressEn: data.updatedAddressEn,
            });

            // Retrieve and verify updated values
            const retrieved = await settingsService.getContactSettings();
            expect(retrieved.addressAr).toBe(data.updatedAddressAr);
            expect(retrieved.addressEn).toBe(data.updatedAddressEn);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test bilingual data independence
   * Validates: Requirement 10.1 - Content must be available in both languages
   */
  describe('Bilingual Data Independence', () => {
    it('should maintain independence between Arabic and English data across all entities', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            productNameAr: nonEmptyString({ maxLength: 100 }),
            productNameEn: nonEmptyString({ maxLength: 100 }),
            productDescAr: nonEmptyString({ maxLength: 500 }),
            productDescEn: nonEmptyString({ maxLength: 500 }),
            categoryNameAr: nonEmptyString({ maxLength: 100 }),
            categoryNameEn: nonEmptyString({ maxLength: 100 }),
            colorNameAr: nonEmptyString({ maxLength: 100 }),
            colorNameEn: nonEmptyString({ maxLength: 100 }),
          }),
          async (data) => {
            // Create category
            const category = await categoryService.create({
              nameAr: data.categoryNameAr,
              nameEn: data.categoryNameEn,
            });

            // Create color
            const color = await colorService.create({
              nameAr: data.colorNameAr,
              nameEn: data.colorNameEn,
              hexCode: '#FF0000',
            });

            // Create product
            const product = await productService.create({
              nameAr: data.productNameAr,
              nameEn: data.productNameEn,
              descAr: data.productDescAr,
              descEn: data.productDescEn,
              categoryIds: [category.id],
              colorIds: [color.id],
            });

            // Retrieve all entities
            const retrievedProduct = await productService.getById(product.id);
            const retrievedCategory = await categoryService.getById(category.id);
            const retrievedColor = await colorService.getById(color.id);

            // Verify Arabic data is independent and correct
            expect(retrievedProduct!.nameAr).toBe(data.productNameAr.trim());
            expect(retrievedProduct!.descAr).toBe(data.productDescAr.trim());
            expect(retrievedCategory!.nameAr).toBe(data.categoryNameAr.trim());
            expect(retrievedColor!.nameAr).toBe(data.colorNameAr.trim());

            // Verify English data is independent and correct
            expect(retrievedProduct!.nameEn).toBe(data.productNameEn.trim());
            expect(retrievedProduct!.descEn).toBe(data.productDescEn.trim());
            expect(retrievedCategory!.nameEn).toBe(data.categoryNameEn.trim());
            expect(retrievedColor!.nameEn).toBe(data.colorNameEn.trim());

            // Verify no cross-contamination between languages
            expect(retrievedProduct!.nameAr).not.toBe(retrievedProduct!.nameEn);
            expect(retrievedCategory!.nameAr).not.toBe(retrievedCategory!.nameEn);
            expect(retrievedColor!.nameAr).not.toBe(retrievedColor!.nameEn);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
