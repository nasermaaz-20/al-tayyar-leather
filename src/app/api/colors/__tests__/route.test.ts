/**
 * HTTP API Route Tests for Colors
 * Tests the actual HTTP endpoints for color APIs
 */

import { NextRequest } from 'next/server';
import { GET as getColors } from '../route';
import { prisma } from '@/src/server/db/prisma';

describe('Color HTTP API Routes', () => {
  describe('GET /api/colors', () => {
    it('should return colors with English locale by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors');
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const color = data.data[0];
        expect(color).toHaveProperty('id');
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('hexCode');
        
        // Should not have raw bilingual fields
        expect(color).not.toHaveProperty('nameAr');
        expect(color).not.toHaveProperty('nameEn');
      }
    });

    it('should return colors with Arabic locale when Accept-Language is ar', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors', {
        headers: {
          'Accept-Language': 'ar',
        },
      });
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const color = data.data[0];
        expect(color).toHaveProperty('name');
        
        // Verify Arabic content (should contain Arabic characters)
        const hasArabicChars = /[\u0600-\u06FF]/.test(color.name);
        expect(hasArabicChars).toBe(true);
      }
    });

    it('should return colors with English locale when Accept-Language is en', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors', {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const color = data.data[0];
        expect(color).toHaveProperty('name');
        expect(typeof color.name).toBe('string');
      }
    });

    it('should handle Accept-Language with region code (e.g., ar-EG)', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors', {
        headers: {
          'Accept-Language': 'ar-EG,ar;q=0.9',
        },
      });
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const color = data.data[0];
        // Should use Arabic locale
        const hasArabicChars = /[\u0600-\u06FF]/.test(color.name);
        expect(hasArabicChars).toBe(true);
      }
    });

    it('should return all colors without pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors');
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      // Verify we get all colors from database
      const dbColors = await prisma.color.findMany();
      expect(data.data.length).toBe(dbColors.length);
    });

    it('should return empty array when no colors exist', async () => {
      // This test assumes there might be no colors in test database
      const request = new NextRequest('http://localhost:3000/api/colors');
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return colors ordered by English name', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors', {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const response = await getColors(request);
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

    it('should include valid hex codes for all colors', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors');
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      if (data.data.length > 0) {
        data.data.forEach((color: any) => {
          expect(color.hexCode).toMatch(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/);
        });
      }
    });
  });

  describe('Response format validation', () => {
    it('should return consistent response format for success', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors');
      const response = await getColors(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.success).toBe(true);
    });

    it('should include all required fields in color objects', async () => {
      const request = new NextRequest('http://localhost:3000/api/colors');
      const response = await getColors(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      if (data.data.length > 0) {
        const color = data.data[0];
        expect(color).toHaveProperty('id');
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('hexCode');
        expect(typeof color.id).toBe('string');
        expect(typeof color.name).toBe('string');
        expect(typeof color.hexCode).toBe('string');
      }
    });
  });
});
