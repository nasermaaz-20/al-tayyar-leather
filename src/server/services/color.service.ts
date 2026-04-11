import { prisma } from '@/src/server/db/prisma';

export interface CreateColorDto {
  nameAr: string;
  nameEn: string;
  hexCode: string;
}

export interface UpdateColorDto {
  nameAr?: string;
  nameEn?: string;
  hexCode?: string;
}

/**
 * Validate hex code format
 */
function validateHexCode(hexCode: string): boolean {
  // Accepts formats: #RGB, #RRGGBB, #RRGGBBAA
  const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexPattern.test(hexCode);
}

export class ColorService {
  /**
   * Get all colors
   */
  async getAll() {
    return await prisma.color.findMany({
      orderBy: { nameEn: 'asc' },
    });
  }

  /**
   * Get a single color by ID
   */
  async getById(id: string) {
    return await prisma.color.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new color
   */
  async create(data: CreateColorDto) {
    // Validate required fields
    if (!data.nameAr || !data.nameAr.trim()) {
      throw new Error('Arabic name is required');
    }
    if (!data.nameEn || !data.nameEn.trim()) {
      throw new Error('English name is required');
    }
    if (!data.hexCode || !data.hexCode.trim()) {
      throw new Error('Hex code is required');
    }

    // Validate hex code format
    const hexCode = data.hexCode.trim();
    if (!validateHexCode(hexCode)) {
      throw new Error('Invalid hex code format. Expected format: #RGB, #RRGGBB, or #RRGGBBAA');
    }

    // Create color
    return await prisma.color.create({
      data: {
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn.trim(),
        hexCode,
      },
    });
  }

  /**
   * Update an existing color
   */
  async update(id: string, data: UpdateColorDto) {
    // Check if color exists
    const existing = await prisma.color.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Color not found');
    }

    // Validate fields if provided
    if (data.nameAr !== undefined && !data.nameAr.trim()) {
      throw new Error('Arabic name cannot be empty');
    }
    if (data.nameEn !== undefined && !data.nameEn.trim()) {
      throw new Error('English name cannot be empty');
    }
    if (data.hexCode !== undefined) {
      const hexCode = data.hexCode.trim();
      if (!hexCode) {
        throw new Error('Hex code cannot be empty');
      }
      if (!validateHexCode(hexCode)) {
        throw new Error('Invalid hex code format. Expected format: #RGB, #RRGGBB, or #RRGGBBAA');
      }
    }

    // Update color
    return await prisma.color.update({
      where: { id },
      data: {
        nameAr: data.nameAr?.trim(),
        nameEn: data.nameEn?.trim(),
        hexCode: data.hexCode?.trim(),
      },
    });
  }

  /**
   * Delete a color
   * Throws an error if the color is used by any products
   */
  async delete(id: string): Promise<void> {
    // Check if color exists
    const existing = await prisma.color.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Color not found');
    }

    // (Check removed: Colors can now be deleted even if products are using them)

    // Delete color
    await prisma.color.delete({
      where: { id },
    });
  }

  /**
   * Check if a color is used by any products
   */
  async isUsedByProducts(id: string): Promise<boolean> {
    const count = await prisma.productColor.count({
      where: { colorId: id },
    });

    return count > 0;
  }
}

// Export singleton instance
export const colorService = new ColorService();

