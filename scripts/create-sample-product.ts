/**
 * Script to create a sample product for testing
 */

import { ProductService } from '@/src/server/services/product.service';
import { prisma } from '@/src/server/db/prisma';

async function createSampleProduct() {
  console.log('Creating sample product...');

  const productService = new ProductService();

  // Get categories and colors
  const categories = await prisma.category.findMany();
  const colors = await prisma.color.findMany();

  if (categories.length === 0 || colors.length === 0) {
    console.error('Please run seed first: npx prisma db seed');
    process.exit(1);
  }

  try {
    const product = await productService.create({
      nameAr: 'حقيبة جلدية فاخرة',
      nameEn: 'Premium Leather Bag',
      descAr: 'حقيبة جلدية فاخرة مصنوعة يدوياً من أجود أنواع الجلد الطبيعي. تتميز بتصميم عصري وأنيق يناسب جميع المناسبات.',
      descEn: 'Premium handcrafted leather bag made from the finest natural leather. Features a modern and elegant design suitable for all occasions.',
      price: 299.99,
      categoryIds: [categories[0].id],
      colorIds: [colors[0].id, colors[1].id],
      images: [
        {
          url: '/img/photo_5947255985623731859_y.jpg',
          alt: 'Leather bag front view',
          order: 0,
        },
        {
          url: '/img/photo_5947255985623731860_y.jpg',
          alt: 'Leather bag side view',
          order: 1,
        },
      ],
    });

    console.log('✅ Sample product created successfully!');
    console.log(`   ID: ${product.id}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Name (EN): ${product.nameEn}`);
    console.log(`   Name (AR): ${product.nameAr}`);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleProduct();
