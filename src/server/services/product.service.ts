import { prisma } from '@/src/server/db/prisma';
import { Prisma } from '@prisma/client';

export interface ProductFilters {
  categoryIds?: string[];
  colorIds?: string[];
  searchQuery?: string;
}

export interface CreateProductDto {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price?: number;
  images?: Array<{ url: string; alt: string; order: number }>;
  categoryIds: string[];
  colorIds?: string[];
}

export interface UpdateProductDto {
  nameAr?: string;
  nameEn?: string;
  descAr?: string;
  descEn?: string;
  price?: number | null;
  images?: Array<{ url: string; alt: string; order: number }>;
  categoryIds?: string[];
  colorIds?: string[];
}

/**
 * Generate a URL-friendly slug from a product name
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
    const existing = await prisma.product.findUnique({
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

export class ProductService {
  /**
   * Get all products with optional filtering
   */
  async getAll(filters?: ProductFilters) {
    const where: Prisma.ProductWhereInput = {};

    // Apply category filter
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: {
            in: filters.categoryIds,
          },
        },
      };
    }

    // Apply color filter
    if (filters?.colorIds && filters.colorIds.length > 0) {
      where.colors = {
        some: {
          colorId: {
            in: filters.colorIds,
          },
        },
      };
    }

    // Apply search query filter
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.trim();
      where.OR = [
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { descAr: { contains: searchTerm, mode: 'insensitive' } },
        { descEn: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        colors: {
          include: {
            color: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to flatten the many-to-many relationships
    return products.map((product) => ({
      ...product,
      colors: product.colors.map((pc) => pc.color),
      categories: product.categories.map((pc) => pc.category),
    }));
  }

  /**
   * Get a single product by slug
   */
  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        colors: {
          include: {
            color: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Transform the data to flatten the many-to-many relationships
    return {
      ...product,
      colors: product.colors.map((pc) => pc.color),
      categories: product.categories.map((pc) => pc.category),
    };
  }

  /**
   * Get a single product by ID
   */
  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        colors: {
          include: {
            color: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Transform the data to flatten the many-to-many relationships
    return {
      ...product,
      colors: product.colors.map((pc) => pc.color),
      categories: product.categories.map((pc) => pc.category),
    };
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductDto) {
    // Validate required fields
    if (!data.nameAr || !data.nameAr.trim()) {
      throw new Error('Arabic name is required');
    }
    if (!data.nameEn || !data.nameEn.trim()) {
      throw new Error('English name is required');
    }
    if (!data.descAr || !data.descAr.trim()) {
      throw new Error('Arabic description is required');
    }
    if (!data.descEn || !data.descEn.trim()) {
      throw new Error('English description is required');
    }
    if (!data.categoryIds || data.categoryIds.length === 0) {
      throw new Error('At least one category must be selected');
    }

    // Generate unique slug from English name
    const baseSlug = generateSlug(data.nameEn);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create product with all relationships
    const product = await prisma.product.create({
      data: {
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn.trim(),
        descAr: data.descAr.trim(),
        descEn: data.descEn.trim(),
        price: data.price !== undefined ? data.price : null,
        slug,
        images: data.images
          ? {
              create: data.images.map((img) => ({
                url: img.url,
                alt: img.alt,
                order: img.order,
              })),
            }
          : undefined,
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        colors: data.colorIds
          ? {
              create: data.colorIds.map((colorId) => ({
                colorId,
              })),
            }
          : undefined,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        colors: {
          include: {
            color: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transform the data to flatten the many-to-many relationships
    return {
      ...product,
      colors: product.colors.map((pc) => pc.color),
      categories: product.categories.map((pc) => pc.category),
    };
  }

  /**
   * Update an existing product
   */
  async update(id: string, data: UpdateProductDto) {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Product not found');
    }

    // Validate fields if provided
    if (data.nameAr !== undefined && !data.nameAr.trim()) {
      throw new Error('Arabic name cannot be empty');
    }
    if (data.nameEn !== undefined && !data.nameEn.trim()) {
      throw new Error('English name cannot be empty');
    }
    if (data.descAr !== undefined && !data.descAr.trim()) {
      throw new Error('Arabic description cannot be empty');
    }
    if (data.descEn !== undefined && !data.descEn.trim()) {
      throw new Error('English description cannot be empty');
    }
    if (data.categoryIds !== undefined && data.categoryIds.length === 0) {
      throw new Error('At least one category must be selected');
    }

    // Generate new slug if name changed
    let slug = existing.slug;
    if (data.nameEn && data.nameEn !== existing.nameEn) {
      const baseSlug = generateSlug(data.nameEn);
      slug = await ensureUniqueSlug(baseSlug, id);
    }

    // Prepare update data
    const updateData: Prisma.ProductUpdateInput = {
      nameAr: data.nameAr?.trim(),
      nameEn: data.nameEn?.trim(),
      descAr: data.descAr?.trim(),
      descEn: data.descEn?.trim(),
      price: data.price !== undefined ? data.price : undefined,
      slug,
    };

    // Handle images update
    if (data.images !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: data.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          order: img.order,
        })),
      };
    }

    // Handle categories update
    if (data.categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: data.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      };
    }

    // Handle colors update
    if (data.colorIds !== undefined) {
      updateData.colors = {
        deleteMany: {},
        create: data.colorIds.map((colorId) => ({
          colorId,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        colors: {
          include: {
            color: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transform the data to flatten the many-to-many relationships
    return {
      ...product,
      colors: product.colors.map((pc) => pc.color),
      categories: product.categories.map((pc) => pc.category),
    };
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<void> {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Product not found');
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const productService = new ProductService();
