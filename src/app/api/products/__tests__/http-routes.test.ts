/**
 * HTTP API Route Tests
 * Tests the actual HTTP endpoints for product APIs
 */

import { NextRequest } from 'next/server';
import { GET as getProducts } from '../route';
import { GET as getProductBySlug } from '../[slug]/route';
import { prisma } from '@/src/server/db/prisma';

describe('Product HTTP API Routes', () => {
  let testProductSlug: string;

  beforeAll(async () => {
    // Get a product from the database for testing
    const product = await prisma.product.findFirst({
      include: {
        images: true,
        colors: { include: { color: true } },
        categories: { include: { category: true } },
      },
    });

    if (product) {
      testProductSlug = product.slug;
    }
  });

  describe('GET /api/products', () => {
    it('should return products with English locale by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const product = data.data[0];
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('slug');
        expect(product).toHaveProperty('images');
        expect(product).toHaveProperty('colors');
        expect(product).toHaveProperty('categories');
        
        // Should not have raw bilingual fields
        expect(product).not.toHaveProperty('nameAr');
        expect(product).not.toHaveProperty('nameEn');
      }
    });

    it('should return products with Arabic locale when Accept-Language is ar', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        headers: {
          'Accept-Language': 'ar',
        },
      });
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const product = data.data[0];
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        
        // Verify Arabic content (should contain Arabic characters)
        const hasArabicChars = /[\u0600-\u06FF]/.test(product.name);
        expect(hasArabicChars).toBe(true);
      }
    });

    it('should filter products by categoryIds', async () => {
      const category = await prisma.category.findFirst();
      if (!category) {
        console.log('Skipping test: no categories found');
        return;
      }

      const request = new NextRequest(
        `http://localhost:3000/api/products?categoryIds=${category.id}`
      );
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      // All returned products should have the specified category
      data.data.forEach((product: any) => {
        const hasCategory = product.categories.some((c: any) => c.id === category.id);
        expect(hasCategory).toBe(true);
      });
    });

    it('should filter products by colorIds', async () => {
      const color = await prisma.color.findFirst();
      if (!color) {
        console.log('Skipping test: no colors found');
        return;
      }

      const request = new NextRequest(
        `http://localhost:3000/api/products?colorIds=${color.id}`
      );
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      // All returned products should have the specified color
      data.data.forEach((product: any) => {
        const hasColor = product.colors.some((c: any) => c.id === color.id);
        expect(hasColor).toBe(true);
      });
    });

    it('should filter products by multiple categoryIds', async () => {
      const categories = await prisma.category.findMany({ take: 2 });
      if (categories.length < 2) {
        console.log('Skipping test: not enough categories');
        return;
      }

      const categoryIds = categories.map(c => c.id).join(',');
      const request = new NextRequest(
        `http://localhost:3000/api/products?categoryIds=${categoryIds}`
      );
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle searchQuery parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/products?searchQuery=leather'
      );
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return empty array when no products match filters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/products?categoryIds=non-existent-id'
      );
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(0);
    });
  });

  describe('GET /api/products/[slug]', () => {
    it('should return a product by slug with English locale', async () => {
      if (!testProductSlug) {
        console.log('Skipping test: no products found');
        return;
      }

      const request = new NextRequest(
        `http://localhost:3000/api/products/${testProductSlug}`
      );
      const response = await getProductBySlug(request, { params: { slug: testProductSlug } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.slug).toBe(testProductSlug);
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('description');
      expect(data.data).toHaveProperty('images');
      expect(data.data).toHaveProperty('colors');
      expect(data.data).toHaveProperty('categories');
    });

    it('should return a product with Arabic locale when Accept-Language is ar', async () => {
      if (!testProductSlug) {
        console.log('Skipping test: no products found');
        return;
      }

      const request = new NextRequest(
        `http://localhost:3000/api/products/${testProductSlug}`,
        {
          headers: {
            'Accept-Language': 'ar',
          },
        }
      );
      const response = await getProductBySlug(request, { params: { slug: testProductSlug } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();

      // Verify Arabic content
      const hasArabicChars = /[\u0600-\u06FF]/.test(data.data.name);
      expect(hasArabicChars).toBe(true);
    });

    it('should return 404 for non-existent slug', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/products/non-existent-slug-12345'
      );
      const response = await getProductBySlug(request, {
        params: { slug: 'non-existent-slug-12345' },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should include all product relations (images, colors, categories)', async () => {
      if (!testProductSlug) {
        console.log('Skipping test: no products found');
        return;
      }

      const request = new NextRequest(
        `http://localhost:3000/api/products/${testProductSlug}`
      );
      const response = await getProductBySlug(request, { params: { slug: testProductSlug } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.images)).toBe(true);
      expect(Array.isArray(data.data.colors)).toBe(true);
      expect(Array.isArray(data.data.categories)).toBe(true);

      // Verify color structure
      if (data.data.colors.length > 0) {
        const color = data.data.colors[0];
        expect(color).toHaveProperty('id');
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('hexCode');
      }

      // Verify category structure
      if (data.data.categories.length > 0) {
        const category = data.data.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
      }
    });

    it('should handle products with null price', async () => {
      if (!testProductSlug) {
        console.log('Skipping test: no products found');
        return;
      }

      const request = new NextRequest(
        `http://localhost:3000/api/products/${testProductSlug}`
      );
      const response = await getProductBySlug(request, { params: { slug: testProductSlug } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('price');
      // Price can be null or a number
      expect(data.data.price === null || typeof data.data.price === 'number').toBe(true);
    });
  });

  describe('Response format validation', () => {
    it('should return consistent response format for success', async () => {
      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await getProducts(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.success).toBe(true);
    });

    it('should return consistent response format for errors', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/products/non-existent-slug'
      );
      const response = await getProductBySlug(request, {
        params: { slug: 'non-existent-slug' },
      });
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });
});
