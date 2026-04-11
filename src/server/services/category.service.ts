import { prisma } from '@/src/server/db/prisma';

export interface CreateCategoryDto {
  nameAr: string;
  nameEn: string;
}

export interface UpdateCategoryDto {
  nameAr?: string;
  nameEn?: string;
}

/**
 * Generate a URL-friendly slug from a category name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure slug is unique by appending a number if necessary
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export class CategoryService {
  /**
   * Get all categories
   */
  async getAll() {
    return await prisma.category.findMany({
      orderBy: { nameEn: 'asc' },
    });
  }

  /**
   * Get a single category by ID
   */
  async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryDto) {
    // Validate required fields
    if (!data.nameAr || !data.nameAr.trim()) {
      throw new Error('Arabic name is required');
    }
    if (!data.nameEn || !data.nameEn.trim()) {
      throw new Error('English name is required');
    }

    // Generate unique slug from English name
    const baseSlug = generateSlug(data.nameEn);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create category
    return await prisma.category.create({
      data: {
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn.trim(),
        slug,
      },
    });
  }

  /**
   * Update an existing category
   */
  async update(id: string, data: UpdateCategoryDto) {
    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    // Validate fields if provided
    if (data.nameAr !== undefined && !data.nameAr.trim()) {
      throw new Error('Arabic name cannot be empty');
    }
    if (data.nameEn !== undefined && !data.nameEn.trim()) {
      throw new Error('English name cannot be empty');
    }

    // Generate new slug if English name changed
    let slug = existing.slug;
    if (data.nameEn && data.nameEn !== existing.nameEn) {
      const baseSlug = generateSlug(data.nameEn);
      slug = await ensureUniqueSlug(baseSlug, id);
    }

    // Update category
    return await prisma.category.update({
      where: { id },
      data: {
        nameAr: data.nameAr?.trim(),
        nameEn: data.nameEn?.trim(),
        slug,
      },
    });
  }

  /**
   * Delete a category
   * Throws an error if the category has associated products
   */
  async delete(id: string): Promise<void> {
    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    // (Check removed: Categories can now be deleted even if products are assigned)

    // Delete category
    await prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Check if a category has any associated products
   */
  async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.productCategory.count({
      where: { categoryId: id },
    });

    return count > 0;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();

