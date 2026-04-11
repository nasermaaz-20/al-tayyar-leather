import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { successResponse, serverError } from '@/src/shared/utils/api-response';

/**
 * POST /api/admin/auth/logout
 * Admin logout endpoint
 * Protected route - requires authentication
 * 
 * This endpoint handles logout by clearing the session.
 * The actual session termination is handled by NextAuth.js.
 * Clients should call NextAuth's signOut() function or clear local session data.
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      // Return success response
      // The client should handle calling NextAuth's signOut() to clear the session
      return successResponse({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return serverError('Logout failed');
    }
  });
}
