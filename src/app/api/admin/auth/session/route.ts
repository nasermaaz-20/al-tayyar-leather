import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/src/server/middleware/auth.middleware';
import { successResponse, unauthorizedError } from '@/src/shared/utils/api-response';

/**
 * GET /api/admin/auth/session
 * Get current authenticated user session
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return unauthorizedError('Not authenticated');
  }

  return successResponse({
    user: {
      id: user.id,
      username: user.username,
    },
  });
}
