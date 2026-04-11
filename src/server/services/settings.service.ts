import { prisma } from '@/src/server/db/prisma';

/**
 * Contact settings interface
 */
export interface ContactSettings {
  whatsappNumber: string;
  tiktokUrl: string;
  addressAr: string;
  addressEn: string;
  facebookUrl?: string;
  instagramUrl?: string;
  email?: string;
}

/**
 * Settings keys for contact information
 */
const SETTINGS_KEYS = {
  WHATSAPP_NUMBER: 'contact.whatsappNumber',
  TIKTOK_URL: 'contact.tiktokUrl',
  ADDRESS_AR: 'contact.addressAr',
  ADDRESS_EN: 'contact.addressEn',
  FACEBOOK_URL: 'contact.facebookUrl',
  INSTAGRAM_URL: 'contact.instagramUrl',
  EMAIL: 'contact.email',
} as const;

/**
 * SettingsService handles contact information management
 * Stores settings as key-value pairs in the Settings table
 */
export class SettingsService {
  /**
   * Get all contact settings
   * @returns ContactSettings object with all contact information
   */
  async getContactSettings(): Promise<ContactSettings> {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: Object.values(SETTINGS_KEYS),
        },
      },
    });

    // Create a map for easy lookup
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    return {
      whatsappNumber: settingsMap.get(SETTINGS_KEYS.WHATSAPP_NUMBER) || '',
      tiktokUrl: settingsMap.get(SETTINGS_KEYS.TIKTOK_URL) || '',
      addressAr: settingsMap.get(SETTINGS_KEYS.ADDRESS_AR) || '',
      addressEn: settingsMap.get(SETTINGS_KEYS.ADDRESS_EN) || '',
      facebookUrl: settingsMap.get(SETTINGS_KEYS.FACEBOOK_URL) || '',
      instagramUrl: settingsMap.get(SETTINGS_KEYS.INSTAGRAM_URL) || '',
      email: settingsMap.get(SETTINGS_KEYS.EMAIL) || '',
    };
  }

  /**
   * Update contact settings
   * Only updates the fields provided in the data parameter
   * @param data Partial contact settings to update
   * @returns Updated ContactSettings object
   */
  async updateContactSettings(
    data: Partial<ContactSettings>
  ): Promise<ContactSettings> {
    // Build array of updates to perform
    const updates: Array<{ key: string; value: string }> = [];

    if (data.whatsappNumber !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.WHATSAPP_NUMBER,
        value: data.whatsappNumber,
      });
    }

    if (data.tiktokUrl !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.TIKTOK_URL,
        value: data.tiktokUrl,
      });
    }

    if (data.addressAr !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.ADDRESS_AR,
        value: data.addressAr,
      });
    }

    if (data.addressEn !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.ADDRESS_EN,
        value: data.addressEn,
      });
    }

    if (data.facebookUrl !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.FACEBOOK_URL,
        value: data.facebookUrl,
      });
    }

    if (data.instagramUrl !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.INSTAGRAM_URL,
        value: data.instagramUrl,
      });
    }

    if (data.email !== undefined) {
      updates.push({
        key: SETTINGS_KEYS.EMAIL,
        value: data.email,
      });
    }

    // Perform all updates using upsert to handle both create and update
    await Promise.all(
      updates.map((update) =>
        prisma.settings.upsert({
          where: { key: update.key },
          update: { value: update.value },
          create: { key: update.key, value: update.value },
        })
      )
    );

    // Return the updated settings
    return this.getContactSettings();
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
