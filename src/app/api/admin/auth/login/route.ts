import { NextRequest } from 'next/server';
import { authService } from '@/src/server/services/auth.service';
import { successResponse, validationError, unauthorizedError, serverError } from '@/src/shared/utils/api-response';

/**
 * POST /api/admin/auth/login
 * Admin login endpoint
 * 
 * This endpoint validates credentials and returns user information.
 * Session management is handled by NextAuth.js through the /api/auth/[...nextauth] endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return validationError({
        username: !username ? 'Username is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      });
    }

    // Validate credentials using auth service
    const result = await authService.login({ username, password });

    if (!result.success) {
      return unauthorizedError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    // Return success with user information
    return successResponse({
      user: result.user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return serverError('Authentication failed');
  }
}
