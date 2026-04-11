# Leather E-Commerce Platform

A bilingual (Arabic/English) e-commerce platform for selling leather products, built with Next.js 14+, TypeScript, Prisma, and PostgreSQL.

## Features

- 🌐 Bilingual support (Arabic RTL / English LTR)
- 🎨 Dark/Light theme mode
- 🛍️ Product catalog with filtering
- 📱 Responsive design
- 🔐 Admin dashboard (Arabic only)
- 💬 WhatsApp integration
- 🖼️ Image optimization
- ✨ Advanced animations with Framer Motion

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Internationalization**: next-intl
- **Animations**: Framer Motion
- **Testing**: Jest + fast-check (property-based testing)
- **Image Processing**: Sharp

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure your database connection and other settings.

4. Initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

The project uses PostgreSQL. Make sure you have PostgreSQL installed and running.

### Create Database

```bash
createdb leather_ecommerce
```

### Environment Variables

Update your `.env` file with the correct database URL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/leather_ecommerce?schema=public"
```

### Migrations

```bash
# Create a new migration
npm run db:migrate

# View database in Prisma Studio
npm run db:studio
```

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility functions and services
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/                 # Static assets
│   ├── img/               # Images
│   └── uploads/           # User uploaded files
├── messages/              # i18n translation files
└── __tests__/             # Test files

```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Admin Access

Default admin credentials (change after first login):
- Username: `admin`
- Password: Set via `ADMIN_PASSWORD` environment variable

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## License

Private - All rights reserved
