import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  })
  console.log('✓ Admin user created:', admin.username)

  // Create initial categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'bags' },
      update: {},
      create: {
        nameAr: 'حقائب',
        nameEn: 'Bags',
        slug: 'bags',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'wallets' },
      update: {},
      create: {
        nameAr: 'محافظ',
        nameEn: 'Wallets',
        slug: 'wallets',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'belts' },
      update: {},
      create: {
        nameAr: 'أحزمة',
        nameEn: 'Belts',
        slug: 'belts',
      },
    }),
  ])
  console.log('✓ Categories created:', categories.length)

  // Create initial colors
  const colors = await Promise.all([
    prisma.color.upsert({
      where: { id: 'brown' },
      update: {},
      create: {
        id: 'brown',
        nameAr: 'بني',
        nameEn: 'Brown',
        hexCode: '#8B4513',
      },
    }),
    prisma.color.upsert({
      where: { id: 'black' },
      update: {},
      create: {
        id: 'black',
        nameAr: 'أسود',
        nameEn: 'Black',
        hexCode: '#000000',
      },
    }),
    prisma.color.upsert({
      where: { id: 'tan' },
      update: {},
      create: {
        id: 'tan',
        nameAr: 'بيج',
        nameEn: 'Tan',
        hexCode: '#D2B48C',
      },
    }),
  ])
  console.log('✓ Colors created:', colors.length)

  // Create initial settings
  const settings = await Promise.all([
    prisma.settings.upsert({
      where: { key: 'whatsapp_number' },
      update: {},
      create: {
        key: 'whatsapp_number',
        value: '+1234567890',
      },
    }),
    prisma.settings.upsert({
      where: { key: 'tiktok_url' },
      update: {},
      create: {
        key: 'tiktok_url',
        value: 'https://tiktok.com/@leatherstore',
      },
    }),
    prisma.settings.upsert({
      where: { key: 'address_ar' },
      update: {},
      create: {
        key: 'address_ar',
        value: 'شارع الجلود، المدينة، البلد',
      },
    }),
    prisma.settings.upsert({
      where: { key: 'address_en' },
      update: {},
      create: {
        key: 'address_en',
        value: 'Leather Street, City, Country',
      },
    }),
  ])
  console.log('✓ Settings created:', settings.length)

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
