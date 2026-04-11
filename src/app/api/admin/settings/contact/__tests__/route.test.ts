import { NextRequest } from 'next/server';
import { PUT } from '../route';
import { settingsService } from '@/src/server/services/settings.service';
import { getToken } from 'next-auth/jwt';

// Mock dependencies
jest.mock('next-auth/jwt');
jest.mock('@/src/server/services/settings.service');

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockSettingsService = settingsService as jest.Mocked<typeof settingsService>;

describe('PUT /api/admin/settings/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticated user by default
    mockGetToken.mockResolvedValue({
      id: 'admin_1',
      username: 'admin',
    } as any);
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+966501234567',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Validation', () => {
    it('should accept valid WhatsApp number', async () => {
      const validSettings = {
        whatsappNumber: '+966501234567',
        tiktokUrl: 'https://tiktok.com/@user',
        addressAr: 'الرياض، المملكة العربية السعودية',
        addressEn: 'Riyadh, Saudi Arabia',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue(validSettings);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(validSettings);
      expect(mockSettingsService.updateContactSettings).toHaveBeenCalledWith(validSettings);
    });

    it('should reject invalid WhatsApp number format (missing +)', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '966501234567',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.whatsappNumber).toContain('Invalid WhatsApp number format');
    });

    it('should reject invalid WhatsApp number format (starts with +0)', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+0501234567',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.whatsappNumber).toContain('Invalid WhatsApp number format');
    });

    it('should reject invalid WhatsApp number format (too long)', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+9665012345678901234',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.whatsappNumber).toContain('Invalid WhatsApp number format');
    });

    it('should reject WhatsApp number with non-numeric characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+966-50-123-4567',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.whatsappNumber).toContain('Invalid WhatsApp number format');
    });

    it('should accept empty WhatsApp number', async () => {
      const validSettings = {
        whatsappNumber: '',
        tiktokUrl: 'https://tiktok.com/@user',
        addressAr: 'الرياض',
        addressEn: 'Riyadh',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue(validSettings);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid TikTok URL with HTTPS', async () => {
      const validSettings = {
        tiktokUrl: 'https://www.tiktok.com/@username',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: 'https://www.tiktok.com/@username',
        addressAr: '',
        addressEn: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid TikTok URL with HTTP', async () => {
      const validSettings = {
        tiktokUrl: 'http://tiktok.com/@user',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: 'http://tiktok.com/@user',
        addressAr: '',
        addressEn: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid TikTok URL format', async () => {
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
      expect(data.error.details.tiktokUrl).toContain('Invalid TikTok URL format');
    });

    it('should reject TikTok URL with invalid protocol', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          tiktokUrl: 'ftp://tiktok.com/@user',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.tiktokUrl).toContain('must use HTTP or HTTPS protocol');
    });

    it('should accept empty TikTok URL', async () => {
      const validSettings = {
        tiktokUrl: '',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: '',
        addressAr: '',
        addressEn: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid Arabic address', async () => {
      const validSettings = {
        addressAr: 'الرياض، شارع الملك فهد، المملكة العربية السعودية',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: '',
        addressAr: 'الرياض، شارع الملك فهد، المملكة العربية السعودية',
        addressEn: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid English address', async () => {
      const validSettings = {
        addressEn: '123 King Fahd Road, Riyadh, Saudi Arabia',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: '',
        addressAr: '',
        addressEn: '123 King Fahd Road, Riyadh, Saudi Arabia',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(validSettings),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject non-string WhatsApp number', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: 123456789,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.whatsappNumber).toContain('must be a string');
    });

    it('should reject non-string TikTok URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          tiktokUrl: 12345,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.tiktokUrl).toContain('must be a string');
    });

    it('should reject non-string Arabic address', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          addressAr: 12345,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.addressAr).toContain('must be a string');
    });

    it('should reject non-string English address', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          addressEn: 12345,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.addressEn).toContain('must be a string');
    });

    it('should handle multiple validation errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: 'invalid',
          tiktokUrl: 'not-a-url',
          addressAr: 123,
          addressEn: 456,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(Object.keys(data.error.details)).toHaveLength(4);
      expect(data.error.details.whatsappNumber).toBeDefined();
      expect(data.error.details.tiktokUrl).toBeDefined();
      expect(data.error.details.addressAr).toBeDefined();
      expect(data.error.details.addressEn).toBeDefined();
    });
  });

  describe('Partial Updates', () => {
    it('should update only WhatsApp number', async () => {
      const updateData = {
        whatsappNumber: '+966501234567',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '+966501234567',
        tiktokUrl: 'https://tiktok.com/@existing',
        addressAr: 'عنوان موجود',
        addressEn: 'Existing address',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSettingsService.updateContactSettings).toHaveBeenCalledWith(updateData);
    });

    it('should update only TikTok URL', async () => {
      const updateData = {
        tiktokUrl: 'https://tiktok.com/@newuser',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '+966501234567',
        tiktokUrl: 'https://tiktok.com/@newuser',
        addressAr: 'عنوان موجود',
        addressEn: 'Existing address',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSettingsService.updateContactSettings).toHaveBeenCalledWith(updateData);
    });

    it('should update only addresses', async () => {
      const updateData = {
        addressAr: 'عنوان جديد',
        addressEn: 'New address',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '+966501234567',
        tiktokUrl: 'https://tiktok.com/@user',
        addressAr: 'عنوان جديد',
        addressEn: 'New address',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSettingsService.updateContactSettings).toHaveBeenCalledWith(updateData);
    });

    it('should update all fields at once', async () => {
      const updateData = {
        whatsappNumber: '+966501234567',
        tiktokUrl: 'https://tiktok.com/@user',
        addressAr: 'الرياض',
        addressEn: 'Riyadh',
      };

      mockSettingsService.updateContactSettings.mockResolvedValue(updateData);

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updateData);
      expect(mockSettingsService.updateContactSettings).toHaveBeenCalledWith(updateData);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockSettingsService.updateContactSettings.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+966501234567',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
      expect(data.error.message).toBe('Failed to update contact settings');
    });

    it('should handle validation errors from service', async () => {
      mockSettingsService.updateContactSettings.mockRejectedValue(
        new Error('Invalid WhatsApp number format')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '+966501234567',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: '',
        addressAr: '',
        addressEn: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSettingsService.updateContactSettings).toHaveBeenCalledWith({});
    });

    it('should handle WhatsApp number with whitespace', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappNumber: '  +966501234567  ',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle TikTok URL with whitespace', async () => {
      mockSettingsService.updateContactSettings.mockResolvedValue({
        whatsappNumber: '',
        tiktokUrl: '  https://tiktok.com/@user  ',
        addressAr: '',
        addressEn: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify({
          tiktokUrl: '  https://tiktok.com/@user  ',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle various international WhatsApp numbers', async () => {
      const validNumbers = [
        '+1234567890',      // US
        '+447911123456',    // UK
        '+966501234567',    // Saudi Arabia
        '+971501234567',    // UAE
        '+201234567890',    // Egypt
      ];

      for (const number of validNumbers) {
        mockSettingsService.updateContactSettings.mockResolvedValue({
          whatsappNumber: number,
          tiktokUrl: '',
          addressAr: '',
          addressEn: '',
        });

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
  });
});
