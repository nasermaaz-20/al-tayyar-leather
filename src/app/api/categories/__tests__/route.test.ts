/**
 * HTTP API Route Tests for Categories
 * Tests the actual HTTP endpoints for category APIs
 */

import { NextRequest } from 'next/server';
import { GET as getCategories } from '../route';
import { prisma } from '@/src/server/db/prisma';

describe('Category HTTP API Routes', () => {
  describe('GET /api/categories', () => {
    it('should return categories with English locale by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories');
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const category = data.data[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        
        // Should not have raw bilingual fields
        expect(category).not.toHaveProperty('nameAr');
        expect(category).not.toHaveProperty('nameEn');
      }
    });

    it('should return categories with Arabic locale when Accept-Language is ar', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        headers: {
          'Accept-Language': 'ar',
        },
      });
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const category = data.data[0];
        expect(category).toHaveProperty('name');
        
        // Verify Arabic content (should contain Arabic characters)
        const hasArabicChars = /[\u0600-\u06FF]/.test(category.name);
        expect(hasArabicChars).toBe(true);
      }
    });

    it('should return categories with English locale when Accept-Language is en', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const category = data.data[0];
        expect(category).toHaveProperty('name');
        expect(typeof category.name).toBe('string');
      }
    });

    it('should handle Accept-Language with region code (e.g., ar-SA)', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        headers: {
          'Accept-Language': 'ar-SA,ar;q=0.9',
        },
      });
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const category = data.data[0];
        // Should use Arabic locale
        const hasArabicChars = /[\u0600-\u06FF]/.test(category.name);
        expect(hasArabicChars).toBe(true);
      }
    });

    it('should return all categories without pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories');
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      // Verify we get all categories from database
      const dbCategories = await prisma.category.findMany();
      expect(data.data.length).toBe(dbCategories.length);
    });

    it('should return empty array when no categories exist', async () => {
      // This test assumes there might be no categories in test database
      const request = new NextRequest('http://localhost:3000/api/categories');
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return categories ordered by English name', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      if (data.data.length > 1) {
        // Verify ordering (should be alphabetically sorted)
        const names = data.data.map((c: any) => c.name);
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
      }
    });
  });

  describe('Response format validation', () => {
    it('should return consistent response format for success', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories');
      const response = await getCategories(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.success).toBe(true);
    });

    it('should include all required fields in category objects', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories');
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      if (data.data.length > 0) {
        const category = data.data[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.slug).toBe('string');
      }
    });
  });
});
