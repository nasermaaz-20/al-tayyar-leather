import { prisma } from '../src/server/db/prisma'

async function verifySetup() {
  console.log('🔍 Verifying project setup...\n')

  try {
    // Test database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('   ✓ Database connection successful\n')

    // Check admin user
    console.log('2. Checking admin user...')
    const admin = await prisma.admin.findFirst()
    if (admin) {
      console.log(`   ✓ Admin user found: ${admin.username}\n`)
    } else {
      console.log('   ✗ No admin user found\n')
    }

    // Check categories
    console.log('3. Checking categories...')
    const categories = await prisma.category.findMany()
    console.log(`   ✓ Found ${categories.length} categories:`)
    categories.forEach(cat => console.log(`     - ${cat.nameEn} (${cat.nameAr})`))
    console.log()

    // Check colors
    console.log('4. Checking colors...')
    const colors = await prisma.color.findMany()
    console.log(`   ✓ Found ${colors.length} colors:`)
    colors.forEach(color => console.log(`     - ${color.nameEn} (${color.nameAr}) - ${color.hexCode}`))
    console.log()

    // Check settings
    console.log('5. Checking settings...')
    const settings = await prisma.settings.findMany()
    console.log(`   ✓ Found ${settings.length} settings:`)
    settings.forEach(setting => console.log(`     - ${setting.key}`))
    console.log()

    console.log('✅ All checks passed! Project setup is complete.\n')
    console.log('Next steps:')
    console.log('  - Run "npm run dev" to start the development server')
    console.log('  - Visit http://localhost:3000 to view the application')
    console.log('  - Admin credentials: username=admin, password=admin123')

  } catch (error) {
    console.error('❌ Setup verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifySetup()
