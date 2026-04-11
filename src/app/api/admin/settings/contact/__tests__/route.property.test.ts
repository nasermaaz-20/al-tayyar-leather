import fc from 'fast-check';
import { PUT } from '../route';
import { settingsService } from '@/src/server/services/settings.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/settings.service');
jest.mock('@/src/server/middleware/auth.middleware');

/**
 * Property-Based Tests for Admin Settings API Routes
 * Feature: leather-ecommerce-platform
 * 
 * These tests verify universal properties that should hold across all inputs
 * using randomized test data generation with fast-check.
 */
describe('Admin Settings API Routes - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  /**
   * Custom arbitraries for contact settings
   */
  const validWhatsAppNumber = fc.integer({ min: 10, max: 999999999999999 }).map(
    (num) => `+${num}`
  );

  const validUrl = fc.webUrl({ validSchemes: ['http', 'https'] });

  const arabicString = fc.string({ minLength: 1, maxLength: 200 });
  const englishString = fc.string({ minLength: 1, maxLength: 200 });

  /**
   * Property 22: Contact Settings Update and Propagation
   * For any contact setting update, when updated by an admin, the change should 
   * persist immediately and all public-facing displays should reflect the new value.
   * 
   * **Validates: Requirements 8.1, 8.2, 9.3, 9.4**
   */
  describe('PUT /api/admin/settings/contact - Update Property', () => {
    it('should successfully update any valid contact settings', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            whatsappNumber: fc.option(validWhatsAppNumber, { nil: '' }),
            tiktokUrl: fc.option(validUrl, { nil: '' }),
            addressAr: fc.option(arabicString, { nil: '' }),
            addressEn: fc.option(englishString, { nil: '' }),
          }),
          async (settingsData) => {
            const mockSettings = {
              whatsappNumber: settingsData.whatsappNumber || '',
              tiktokUrl: settingsData.tiktokUrl || '',
              addressAr: settingsData.addressAr || '',
              addressEn: settingsData.addressEn || '',
            };

            (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify(settingsData),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockSettings);
            expect(settingsService.updateContactSettings).toHaveBeenCalledWith(settingsData);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should successfully update partial contact settings', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({ whatsappNumber: validWhatsAppNumber }),
            fc.record({ tiktokUrl: validUrl }),
            fc.record({ addressAr: arabicString }),
            fc.record({ addressEn: englishString }),
            fc.record({ whatsappNumber: validWhatsAppNumber, tiktokUrl: validUrl }),
            fc.record({ addressAr: arabicString, addressEn: englishString })
          ),
          async (partialSettings) => {
            const mockSettings = {
              whatsappNumber: '+966501234567',
              tiktokUrl: 'https://tiktok.com/@user',
              addressAr: 'الرياض',
              addressEn: 'Riyadh',
              ...partialSettings,
            };

            (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify(partialSettings),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(settingsService.updateContactSettings).toHaveBeenCalledWith(partialSettings);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept empty strings for all fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            whatsappNumber: fc.constant(''),
            tiktokUrl: fc.constant(''),
            addressAr: fc.constant(''),
            addressEn: fc.constant(''),
          }),
          async (emptySettings) => {
            (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(emptySettings);

            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify(emptySettings),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Invalid WhatsApp number formats should always fail validation
   * Validates: Requirements 8.1
   */
  describe('PUT /api/admin/settings/contact - WhatsApp Validation Property', () => {
    it('should reject invalid WhatsApp number formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Missing + prefix
            fc.integer({ min: 1000000000, max: 999999999999999 }).map(String),
            // Starts with +0
            fc.integer({ min: 100000000, max: 99999999999999 }).map((n) => `+0${n}`),
            // Too long (more than 15 digits after +)
            fc.integer({ min: 10000000000000000, max: 99999999999999999 }).map((n) => `+${n}`),
            // Contains non-numeric characters
            fc.string({ minLength: 5, maxLength: 15 }).map((s) => `+${s}`),
            // Just a +
            fc.constant('+'),
            // Empty + number
            fc.constant('+abc')
          ),
          async (invalidNumber) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify({ whatsappNumber: invalidNumber }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details.whatsappNumber).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-string WhatsApp numbers', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.object(),
            fc.constant(null)
          ),
          async (invalidType) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify({ whatsappNumber: invalidType }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details.whatsappNumber).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Invalid TikTok URL formats should always fail validation
   * Validates: Requirements 8.2
   */
  describe('PUT /api/admin/settings/contact - TikTok URL Validation Property', () => {
    it('should reject invalid TikTok URL formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Not a URL
            fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('://')),
            // Invalid protocol
            fc.string({ minLength: 1, maxLength: 20 }).map((s) => `ftp://${s}.com`),
            fc.string({ minLength: 1, maxLength: 20 }).map((s) => `file://${s}`),
            // Just protocol
            fc.constant('http://'),
            fc.constant('https://')
          ),
          async (invalidUrl) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify({ tiktokUrl: invalidUrl }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details.tiktokUrl).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-string TikTok URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.object(),
            fc.constant(null)
          ),
          async (invalidType) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify({ tiktokUrl: invalidType }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details.tiktokUrl).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Invalid address types should always fail validation
   * Validates: Requirements 8.3
   */
  describe('PUT /api/admin/settings/contact - Address Validation Property', () => {
    it('should reject non-string Arabic addresses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.object(),
            fc.constant(null)
          ),
          async (invalidType) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify({ addressAr: invalidType }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details.addressAr).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject non-string English addresses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.object(),
            fc.constant(null)
          ),
          async (invalidType) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify({ addressEn: invalidType }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details.addressEn).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Response structure should be consistent for all operations
   * Validates: API consistency
   */
  describe('Response Structure Consistency', () => {
    it('should return consistent success response structure for all valid updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            whatsappNumber: fc.option(validWhatsAppNumber, { nil: '' }),
            tiktokUrl: fc.option(validUrl, { nil: '' }),
            addressAr: fc.option(arabicString, { nil: '' }),
            addressEn: fc.option(englishString, { nil: '' }),
          }),
          async (settingsData) => {
            const mockSettings = {
              whatsappNumber: settingsData.whatsappNumber || '',
              tiktokUrl: settingsData.tiktokUrl || '',
              addressAr: settingsData.addressAr || '',
              addressEn: settingsData.addressEn || '',
            };

            (settingsService.updateContactSettings as jest.Mock).mockResolvedValue(mockSettings);

            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify(settingsData),
            });

            const response = await PUT(request);
            const data = await response.json();

            // Verify consistent response structure
            expect(data).toHaveProperty('success');
            expect(data.success).toBe(true);
            expect(data).toHaveProperty('data');
            expect(data.data).toHaveProperty('whatsappNumber');
            expect(data.data).toHaveProperty('tiktokUrl');
            expect(data.data).toHaveProperty('addressAr');
            expect(data.data).toHaveProperty('addressEn');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent error response structure for all validation failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({ whatsappNumber: fc.integer() }),
            fc.record({ tiktokUrl: fc.integer() }),
            fc.record({ addressAr: fc.boolean() }),
            fc.record({ addressEn: fc.array(fc.string()) })
          ),
          async (invalidData) => {
            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify(invalidData),
            });

            const response = await PUT(request);
            const data = await response.json();

            // Verify consistent error response structure
            expect(data).toHaveProperty('success');
            expect(data.success).toBe(false);
            expect(data).toHaveProperty('error');
            expect(data.error).toHaveProperty('code');
            expect(data.error).toHaveProperty('message');
            expect(data.error).toHaveProperty('details');
            expect(data.error.code).toBe('VALIDATION_ERROR');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Service errors should be handled gracefully
   * Validates: Error handling
   */
  describe('Error Handling Property', () => {
    it('should handle service errors gracefully for any input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            whatsappNumber: fc.option(validWhatsAppNumber, { nil: '' }),
            tiktokUrl: fc.option(validUrl, { nil: '' }),
            addressAr: fc.option(arabicString, { nil: '' }),
            addressEn: fc.option(englishString, { nil: '' }),
          }),
          async (settingsData) => {
            (settingsService.updateContactSettings as jest.Mock).mockRejectedValue(
              new Error('Database connection failed')
            );

            const request = new NextRequest('http://localhost:3000/api/admin/settings/contact', {
              method: 'PUT',
              body: JSON.stringify(settingsData),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('SERVER_ERROR');
            expect(data.error.message).toBe('Failed to update contact settings');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
