/**
 * HTTP API Route Tests for Contact Settings
 * Tests the actual HTTP endpoints for contact settings APIs
 */

import { NextRequest } from 'next/server';
import { GET as getContactSettings } from '../route';
import { prisma } from '@/src/server/db/prisma';

describe('Contact Settings HTTP API Routes', () => {
  describe('GET /api/settings/contact', () => {
    beforeEach(async () => {
      // Seed test data for contact settings
      await prisma.settings.upsert({
        where: { key: 'contact.whatsappNumber' },
        update: { value: '+1234567890' },
        create: { key: 'contact.whatsappNumber', value: '+1234567890' },
      });
      await prisma.settings.upsert({
        where: { key: 'contact.tiktokUrl' },
        update: { value: 'https://tiktok.com/@leatherstore' },
        create: { key: 'contact.tiktokUrl', value: 'https://tiktok.com/@leatherstore' },
      });
      await prisma.settings.upsert({
        where: { key: 'contact.addressAr' },
        update: { value: 'شارع الجلود، الرياض، المملكة العربية السعودية' },
        create: { key: 'contact.addressAr', value: 'شارع الجلود، الرياض، المملكة العربية السعودية' },
      });
      await prisma.settings.upsert({
        where: { key: 'contact.addressEn' },
        update: { value: 'Leather Street, Riyadh, Saudi Arabia' },
        create: { key: 'contact.addressEn', value: 'Leather Street, Riyadh, Saudi Arabia' },
      });
    });

    it('should return contact settings with English address by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('whatsappNumber');
      expect(data.data).toHaveProperty('tiktokUrl');
      expect(data.data).toHaveProperty('address');
      
      // Should return English address by default
      expect(data.data.address).toBe('Leather Street, Riyadh, Saudi Arabia');
      expect(data.data.whatsappNumber).toBe('+1234567890');
      expect(data.data.tiktokUrl).toBe('https://tiktok.com/@leatherstore');
    });

    it('should return contact settings with Arabic address when Accept-Language is ar', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact', {
        headers: {
          'Accept-Language': 'ar',
        },
      });
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('address');
      
      // Should return Arabic address
      expect(data.data.address).toBe('شارع الجلود، الرياض، المملكة العربية السعودية');
      
      // Verify Arabic content
      const hasArabicChars = /[\u0600-\u06FF]/.test(data.data.address);
      expect(hasArabicChars).toBe(true);
      
      // WhatsApp and TikTok should be the same regardless of locale
      expect(data.data.whatsappNumber).toBe('+1234567890');
      expect(data.data.tiktokUrl).toBe('https://tiktok.com/@leatherstore');
    });

    it('should return contact settings with English address when Accept-Language is en', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact', {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.address).toBe('Leather Street, Riyadh, Saudi Arabia');
    });

    it('should handle Accept-Language with region code (e.g., ar-SA)', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact', {
        headers: {
          'Accept-Language': 'ar-SA,ar;q=0.9',
        },
      });
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should use Arabic locale
      expect(data.data.address).toBe('شارع الجلود، الرياض، المملكة العربية السعودية');
      const hasArabicChars = /[\u0600-\u06FF]/.test(data.data.address);
      expect(hasArabicChars).toBe(true);
    });

    it('should handle Accept-Language with multiple locales', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact', {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        },
      });
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should use first locale (en)
      expect(data.data.address).toBe('Leather Street, Riyadh, Saudi Arabia');
    });

    it('should return empty strings when settings are not configured', async () => {
      // Clear all settings
      await prisma.settings.deleteMany({
        where: {
          key: {
            in: [
              'contact.whatsappNumber',
              'contact.tiktokUrl',
              'contact.addressAr',
              'contact.addressEn',
            ],
          },
        },
      });

      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.whatsappNumber).toBe('');
      expect(data.data.tiktokUrl).toBe('');
      expect(data.data.address).toBe('');
    });

    it('should not expose raw bilingual address fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).not.toHaveProperty('addressAr');
      expect(data.data).not.toHaveProperty('addressEn');
      expect(data.data).toHaveProperty('address');
    });
  });

  describe('Response format validation', () => {
    beforeEach(async () => {
      // Seed test data
      await prisma.settings.upsert({
        where: { key: 'contact.whatsappNumber' },
        update: { value: '+1234567890' },
        create: { key: 'contact.whatsappNumber', value: '+1234567890' },
      });
      await prisma.settings.upsert({
        where: { key: 'contact.tiktokUrl' },
        update: { value: 'https://tiktok.com/@leatherstore' },
        create: { key: 'contact.tiktokUrl', value: 'https://tiktok.com/@leatherstore' },
      });
      await prisma.settings.upsert({
        where: { key: 'contact.addressAr' },
        update: { value: 'شارع الجلود' },
        create: { key: 'contact.addressAr', value: 'شارع الجلود' },
      });
      await prisma.settings.upsert({
        where: { key: 'contact.addressEn' },
        update: { value: 'Leather Street' },
        create: { key: 'contact.addressEn', value: 'Leather Street' },
      });
    });

    it('should return consistent response format for success', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.success).toBe(true);
    });

    it('should include all required fields in contact settings', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('whatsappNumber');
      expect(data.data).toHaveProperty('tiktokUrl');
      expect(data.data).toHaveProperty('address');
      expect(typeof data.data.whatsappNumber).toBe('string');
      expect(typeof data.data.tiktokUrl).toBe('string');
      expect(typeof data.data.address).toBe('string');
    });

    it('should return exactly three fields in the data object', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const keys = Object.keys(data.data);
      expect(keys).toHaveLength(3);
      expect(keys).toContain('whatsappNumber');
      expect(keys).toContain('tiktokUrl');
      expect(keys).toContain('address');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock prisma to throw an error
      const originalFindMany = prisma.settings.findMany;
      prisma.settings.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/settings/contact');
      const response = await getContactSettings(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data.error.code).toBe('INTERNAL_ERROR');

      // Restore original function
      prisma.settings.findMany = originalFindMany;
    });
  });
});
