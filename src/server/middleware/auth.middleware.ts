import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware to protect admin API routes
 * Checks for valid JWT token from NextAuth
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  return handler(request);
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return !!token;
}

/**
 * Helper function to get current user from token
 */
export async function getCurrentUser(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return null;
  }

  return {
    id: token.id as string,
    username: token.username as string,
  };
}
