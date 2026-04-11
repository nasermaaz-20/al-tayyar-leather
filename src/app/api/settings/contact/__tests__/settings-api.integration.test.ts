/**
 * Integration tests for Contact Settings API
 * Tests the complete flow from API route to database
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { prisma } from '@/src/server/db/prisma';
import { settingsService } from '@/src/server/services/settings.service';

describe('Contact Settings API Integration Tests', () => {
  // Clean up and seed test data before each test
  beforeEach(async () => {
    // Seed contact settings
    await settingsService.updateContactSettings({
      whatsappNumber: '+966501234567',
      tiktokUrl: 'https://tiktok.com/@saudileather',
      addressAr: 'شارع الملك فهد، الرياض 12345، المملكة العربية السعودية',
      addressEn: 'King Fahd Road, Riyadh 12345, Saudi Arabia',
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should retrieve contact settings from database and return localized address', async () => {
    // Act - Call API with Arabic locale
    const request = new NextRequest('http://localhost:3000/api/settings/contact', {
      headers: {
        'Accept-Language': 'ar',
      },
    });
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.whatsappNumber).toBe('+966501234567');
    expect(data.data.tiktokUrl).toBe('https://tiktok.com/@saudileather');
    expect(data.data.address).toBe('شارع الملك فهد، الرياض 12345، المملكة العربية السعودية');

    // Verify data is actually from database
    const dbSettings = await settingsService.getContactSettings();
    expect(data.data.whatsappNumber).toBe(dbSettings.whatsappNumber);
    expect(data.data.tiktokUrl).toBe(dbSettings.tiktokUrl);
    expect(data.data.address).toBe(dbSettings.addressAr);
  });

  it('should return English address when locale is en', async () => {
    // Act - Call API with English locale
    const request = new NextRequest('http://localhost:3000/api/settings/contact', {
      headers: {
        'Accept-Language': 'en',
      },
    });
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.address).toBe('King Fahd Road, Riyadh 12345, Saudi Arabia');

    // Verify data is actually from database
    const dbSettings = await settingsService.getContactSettings();
    expect(data.data.address).toBe(dbSettings.addressEn);
  });

  it('should reflect database changes immediately', async () => {
    // Arrange - Update settings in database
    await settingsService.updateContactSettings({
      whatsappNumber: '+966509876543',
      tiktokUrl: 'https://tiktok.com/@newleatherstore',
    });

    // Act - Call API
    const request = new NextRequest('http://localhost:3000/api/settings/contact');
    const response = await GET(request);
    const data = await response.json();

    // Assert - Should return updated values
    expect(response.status).toBe(200);
    expect(data.data.whatsappNumber).toBe('+966509876543');
    expect(data.data.tiktokUrl).toBe('https://tiktok.com/@newleatherstore');
  });

  it('should handle partial settings gracefully', async () => {
    // Arrange - Clear all settings
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

    // Only set WhatsApp number
    await settingsService.updateContactSettings({
      whatsappNumber: '+966501111111',
    });

    // Act - Call API
    const request = new NextRequest('http://localhost:3000/api/settings/contact');
    const response = await GET(request);
    const data = await response.json();

    // Assert - Should return WhatsApp number and empty strings for others
    expect(response.status).toBe(200);
    expect(data.data.whatsappNumber).toBe('+966501111111');
    expect(data.data.tiktokUrl).toBe('');
    expect(data.data.address).toBe('');
  });

  it('should maintain data consistency across multiple requests', async () => {
    // Act - Make multiple requests with different locales
    const requestAr = new NextRequest('http://localhost:3000/api/settings/contact', {
      headers: { 'Accept-Language': 'ar' },
    });
    const requestEn = new NextRequest('http://localhost:3000/api/settings/contact', {
      headers: { 'Accept-Language': 'en' },
    });

    const responseAr = await GET(requestAr);
    const responseEn = await GET(requestEn);
    const dataAr = await responseAr.json();
    const dataEn = await responseEn.json();

    // Assert - WhatsApp and TikTok should be the same, only address differs
    expect(dataAr.data.whatsappNumber).toBe(dataEn.data.whatsappNumber);
    expect(dataAr.data.tiktokUrl).toBe(dataEn.data.tiktokUrl);
    expect(dataAr.data.address).not.toBe(dataEn.data.address);
    
    // Verify addresses are correct for each locale
    expect(dataAr.data.address).toBe('شارع الملك فهد، الرياض 12345، المملكة العربية السعودية');
    expect(dataEn.data.address).toBe('King Fahd Road, Riyadh 12345, Saudi Arabia');
  });

  it('should validate that settings are persisted in database', async () => {
    // Arrange - Update settings
    const newSettings = {
      whatsappNumber: '+966502222222',
      tiktokUrl: 'https://tiktok.com/@teststore',
      addressAr: 'عنوان تجريبي',
      addressEn: 'Test Address',
    };
    await settingsService.updateContactSettings(newSettings);

    // Act - Retrieve via API
    const request = new NextRequest('http://localhost:3000/api/settings/contact');
    const response = await GET(request);
    const data = await response.json();

    // Assert - Verify data matches what was stored
    expect(data.data.whatsappNumber).toBe(newSettings.whatsappNumber);
    expect(data.data.tiktokUrl).toBe(newSettings.tiktokUrl);

    // Verify directly from database
    const dbSettings = await prisma.settings.findMany({
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

    const settingsMap = new Map(dbSettings.map((s) => [s.key, s.value]));
    expect(settingsMap.get('contact.whatsappNumber')).toBe(newSettings.whatsappNumber);
    expect(settingsMap.get('contact.tiktokUrl')).toBe(newSettings.tiktokUrl);
    expect(settingsMap.get('contact.addressAr')).toBe(newSettings.addressAr);
    expect(settingsMap.get('contact.addressEn')).toBe(newSettings.addressEn);
  });
});
