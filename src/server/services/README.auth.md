# Authentication Service Documentation

## Overview

The authentication system uses NextAuth.js with JWT tokens for session management and bcrypt for password hashing. It provides secure admin authentication for the leather e-commerce platform.

## Components

### 1. AuthService (`lib/services/auth.service.ts`)

Core authentication service that handles:
- Password hashing with bcrypt (10 salt rounds)
- Password verification
- Admin login with credential validation
- Admin user retrieval

**Key Methods:**

```typescript
// Hash a password
await authService.hashPassword(password: string): Promise<string>

// Verify a password against a hash
await authService.verifyPassword(password: string, hash: string): Promise<boolean>

// Login with credentials
await authService.login(credentials: LoginCredentials): Promise<AuthResult>

// Get admin by username
await authService.getAdminByUsername(username: string)

// Get admin by ID
await authService.getAdminById(id: string)
```

### 2. NextAuth Configuration (`lib/auth.ts`)

NextAuth.js configuration with:
- Credentials provider for username/password authentication
- JWT session strategy with 24-hour expiration
- Custom callbacks for token and session management
- Custom sign-in page at `/admin/login`

### 3. Auth Middleware (`lib/middleware/auth.middleware.ts`)

Middleware functions for protecting admin routes:

```typescript
// Wrap API route handler with authentication check
await withAuth(request: NextRequest, handler: Function)

// Check if user is authenticated
await isAuthenticated(request: NextRequest): Promise<boolean>

// Get current authenticated user
await getCurrentUser(request: NextRequest)
```

### 4. API Routes

**NextAuth API Route:** `app/api/auth/[...nextauth]/route.ts`
- Handles all NextAuth.js authentication endpoints
- POST `/api/auth/signin` - Sign in
- POST `/api/auth/signout` - Sign out
- GET `/api/auth/session` - Get session
- GET `/api/auth/csrf` - Get CSRF token

**Session Check Route:** `app/api/admin/auth/session/route.ts`
- GET `/api/admin/auth/session` - Get current user session

## Usage Examples

### Protecting an Admin API Route

```typescript
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { successResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    // Your protected route logic here
    return successResponse({ message: 'Success' });
  });
}
```

### Client-Side Authentication (React)

```typescript
import { signIn, signOut, useSession } from 'next-auth/react';

// Sign in
const result = await signIn('credentials', {
  username: 'admin',
  password: 'password',
  redirect: false,
});

// Sign out
await signOut({ redirect: true, callbackUrl: '/admin/login' });

// Check session
const { data: session, status } = useSession();
if (status === 'authenticated') {
  console.log('User:', session.user);
}
```

### Server-Side Session Check

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // User is authenticated
  return new Response('Protected content');
}
```

## Environment Variables

Required environment variables in `.env`:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Admin Credentials (for seeding)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

## Security Features

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure session management with signed tokens
3. **Session Expiration**: 24-hour session timeout
4. **CSRF Protection**: Built-in CSRF protection from NextAuth.js
5. **Secure Cookies**: HTTP-only cookies for session storage
6. **Error Handling**: Generic error messages to prevent information leakage

## Database Schema

The `Admin` model in Prisma:

```prisma
model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

## Testing

Unit tests are provided in `lib/services/__tests__/auth.service.test.ts`:

```bash
npm test -- lib/services/__tests__/auth.service.test.ts
```

Tests cover:
- Password hashing
- Password verification
- Login with valid/invalid credentials
- Error handling
- Admin user retrieval

## Requirements Validation

This implementation satisfies the following requirements:

- **12.1**: Admin dashboard requires authentication
- **12.2**: Valid credentials grant access
- **12.3**: Invalid credentials are rejected with error message
- **12.4**: Session expiration requires re-authentication (24-hour JWT expiration)

## Next Steps

To complete the authentication flow:

1. Create admin login page at `app/admin/login/page.tsx`
2. Add SessionProvider to admin layout
3. Implement protected admin routes
4. Add logout functionality to admin dashboard
5. Create middleware to redirect unauthenticated users
