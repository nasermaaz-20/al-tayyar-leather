import { PUT } from '../route';
import { settingsService } from '@/src/server/services/settings.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/settings.service');
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Contact Settings API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  describe('PUT /api/admin/settings/contact', () => {
    it('should update all contact settings with valid data', async () => {
      const mockSettings = {
        whatsappNumber: '+1234567890',
        tiktokUrl: 'https://tiktok.com/@leatherstore',
        addressAr: 'شارع الجلود، الرياض',
        addressEn: 'Leather Street, Riyadh',
      };

      (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(mockSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSettings);
      expect(settingsService.updateContactSettings).toHaveBeenCalledWith(mockSettings);
    });

    it('should update only provided fields', async () => {
      const mockSettings = {
        whatsappNumber: '+9876543210',
        tiktokUrl: 'https://tiktok.com/@leatherstore',
        addressAr: 'شارع الجلود، الرياض',
        addressEn: 'Leather Street, Riyadh',
      };

      (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+9876543210',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(settingsService.updateContactSettings).toHaveBeenCalledWith({
        whatsappNumber: '+9876543210',
      });
    });

    it('should accept empty strings for optional fields', async () => {
      const mockSettings = {
        whatsappNumber: '',
        tiktokUrl: '',
        addressAr: '',
        addressEn: '',
      };

      (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(mockSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return validation error for invalid WhatsApp number format', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: 'invalid-phone',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.whatsappNumber).toContain('Invalid WhatsApp number format');
    });

    it('should accept valid WhatsApp number formats', async () => {
      const validNumbers = [
        '+1234567890',
        '1234567890',
        '+1 (234) 567-890',
        '+1-234-567-890',
      ];

      for (const number of validNumbers) {
        const mockSettings = {
          whatsappNumber: number,
          tiktokUrl: '',
          addressAr: '',
          addressEn: '',
        };

        (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

        const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
          method: 'PUT',
          body: JSON.stringify({ whatsappNumber: number }),
        });

        const response = await PUT(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should return validation error for invalid TikTok URL format', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          tiktokUrl: 'not-a-valid-url',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.tiktokUrl).toContain('Invalid TikTok URL format');
    });

    it('should accept valid TikTok URL formats', async () => {
      const validUrls = [
        'https://tiktok.com/@user',
        'https://www.tiktok.com/@user',
        'http://tiktok.com/@user',
      ];

      for (const url of validUrls) {
        const mockSettings = {
          whatsappNumber: '',
          tiktokUrl: url,
          addressAr: '',
          addressEn: '',
        };

        (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

        const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
          method: 'PUT',
          body: JSON.stringify({ tiktokUrl: url }),
        });

        const response = await PUT(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should return validation error when field types are incorrect', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: 123,
          tiktokUrl: true,
          addressAr: [],
          addressEn: {},
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.whatsappNumber).toBeDefined();
      expect(data.error.details.tiktokUrl).toBeDefined();
      expect(data.error.details.addressAr).toBeDefined();
      expect(data.error.details.addressEn).toBeDefined();
    });
  });
});
