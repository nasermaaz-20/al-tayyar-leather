import { prisma } from '@/src/server/db/prisma';
import { SettingsService, ContactSettings } from '../settings.service';

describe('SettingsService', () => {
  let settingsService: SettingsService;

  beforeEach(async () => {
    settingsService = new SettingsService();
    // Clean up settings before each test
    await prisma.settings.deleteMany({
      where: {
        key: {
          startsWith: 'contact.',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('getContactSettings', () => {
    it('should return empty strings when no settings exist', async () => {
      const settings = await settingsService.getContactSettings();

      expect(settings).toEqual({
        whatsappNumber: '',
        tiktokUrl: '',
        addressAr: '',
        addressEn: '',
      });
    });

    it('should return existing settings', async () => {
      // Create some settings
      await prisma.settings.createMany({
        data: [
          { key: 'contact.whatsappNumber', value: '+1234567890' },
          { key: 'contact.tiktokUrl', value: 'https://tiktok.com/@shop' },
          { key: 'contact.addressAr', value: 'العنوان بالعربي' },
          { key: 'contact.addressEn', value: 'Address in English' },
        ],
      });

      const settings = await settingsService.getContactSettings();

      expect(settings).toEqual({
        whatsappNumber: '+1234567890',
        tiktokUrl: 'https://tiktok.com/@shop',
        addressAr: 'العنوان بالعربي',
        addressEn: 'Address in English',
      });
    });

    it('should return partial settings when only some exist', async () => {
      await prisma.settings.create({
        data: { key: 'contact.whatsappNumber', value: '+1234567890' },
      });

      const settings = await settingsService.getContactSettings();

      expect(settings).toEqual({
        whatsappNumber: '+1234567890',
        tiktokUrl: '',
        addressAr: '',
        addressEn: '',
      });
    });
  });

  describe('updateContactSettings', () => {
    it('should create new settings when they do not exist', async () => {
      const data: ContactSettings = {
        whatsappNumber: '+9876543210',
        tiktokUrl: 'https://tiktok.com/@newshop',
        addressAr: 'عنوان جديد',
        addressEn: 'New Address',
      };

      const result = await settingsService.updateContactSettings(data);

      expect(result).toEqual(data);

      // Verify in database
      const dbSettings = await prisma.settings.findMany({
        where: { key: { startsWith: 'contact.' } },
      });
      expect(dbSettings).toHaveLength(4);
    });

    it('should update existing settings', async () => {
      // Create initial settings
      await prisma.settings.createMany({
        data: [
          { key: 'contact.whatsappNumber', value: '+1111111111' },
          { key: 'contact.tiktokUrl', value: 'https://tiktok.com/@old' },
        ],
      });

      const updates: Partial<ContactSettings> = {
        whatsappNumber: '+2222222222',
        tiktokUrl: 'https://tiktok.com/@new',
      };

      const result = await settingsService.updateContactSettings(updates);

      expect(result.whatsappNumber).toBe('+2222222222');
      expect(result.tiktokUrl).toBe('https://tiktok.com/@new');
    });

    it('should update only provided fields', async () => {
      // Create initial settings
      await prisma.settings.createMany({
        data: [
          { key: 'contact.whatsappNumber', value: '+1111111111' },
          { key: 'contact.addressAr', value: 'عنوان قديم' },
          { key: 'contact.addressEn', value: 'Old Address' },
        ],
      });

      // Update only WhatsApp number
      const updates: Partial<ContactSettings> = {
        whatsappNumber: '+9999999999',
      };

      const result = await settingsService.updateContactSettings(updates);

      expect(result.whatsappNumber).toBe('+9999999999');
      expect(result.addressAr).toBe('عنوان قديم');
      expect(result.addressEn).toBe('Old Address');
      expect(result.tiktokUrl).toBe('');
    });

    it('should handle bilingual address updates', async () => {
      const updates: Partial<ContactSettings> = {
        addressAr: 'شارع الملك فهد، الرياض',
        addressEn: 'King Fahd Street, Riyadh',
      };

      const result = await settingsService.updateContactSettings(updates);

      expect(result.addressAr).toBe('شارع الملك فهد، الرياض');
      expect(result.addressEn).toBe('King Fahd Street, Riyadh');
    });

    it('should persist changes immediately', async () => {
      const data: ContactSettings = {
        whatsappNumber: '+5555555555',
        tiktokUrl: 'https://tiktok.com/@test',
        addressAr: 'اختبار',
        addressEn: 'Test',
      };

      await settingsService.updateContactSettings(data);

      // Fetch again to verify persistence
      const retrieved = await settingsService.getContactSettings();
      expect(retrieved).toEqual(data);
    });

    it('should handle empty string updates', async () => {
      // Create initial settings
      await prisma.settings.create({
        data: { key: 'contact.whatsappNumber', value: '+1234567890' },
      });

      // Update to empty string
      const updates: Partial<ContactSettings> = {
        whatsappNumber: '',
      };

      const result = await settingsService.updateContactSettings(updates);

      expect(result.whatsappNumber).toBe('');
    });

    it('should handle special characters in URLs and addresses', async () => {
      const data: ContactSettings = {
        whatsappNumber: '+966-50-123-4567',
        tiktokUrl: 'https://tiktok.com/@shop?ref=test&utm=source',
        addressAr: 'شارع الأمير محمد بن عبدالعزيز، حي السليمانية، الرياض 12345',
        addressEn: '123 Main St., Suite #456, City, Country 12345',
      };

      const result = await settingsService.updateContactSettings(data);

      expect(result).toEqual(data);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent updates correctly', async () => {
      const update1 = settingsService.updateContactSettings({
        whatsappNumber: '+1111111111',
      });
      const update2 = settingsService.updateContactSettings({
        tiktokUrl: 'https://tiktok.com/@test',
      });

      await Promise.all([update1, update2]);

      const result = await settingsService.getContactSettings();
      expect(result.whatsappNumber).toBe('+1111111111');
      expect(result.tiktokUrl).toBe('https://tiktok.com/@test');
    });

    it('should handle very long text values', async () => {
      const longAddress = 'A'.repeat(1000);
      const updates: Partial<ContactSettings> = {
        addressEn: longAddress,
      };

      const result = await settingsService.updateContactSettings(updates);

      expect(result.addressEn).toBe(longAddress);
      expect(result.addressEn.length).toBe(1000);
    });
  });
});
