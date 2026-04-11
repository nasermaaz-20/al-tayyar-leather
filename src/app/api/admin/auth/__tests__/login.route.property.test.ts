import fc from 'fast-check';
import { POST } from '../login/route';
import { authService } from '@/src/server/services/auth.service';
import { NextRequest } from 'next/server';

// Mock auth service
jest.mock('@/src/server/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe('POST /api/admin/auth/login - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: leather-ecommerce-platform, Property 30: Invalid Authentication Rejection
   * **Validates: Requirements 12.3**
   * 
   * For any invalid admin credentials, the authentication should fail and return
   * an appropriate error message without granting access.
   */
  it('should reject all invalid credentials with 401 status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 50 }),
          password: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (credentials) => {
          // Mock auth service to return failure
          (authService.login as jest.Mock).mockResolvedValue({
            success: false,
            error: 'Invalid credentials',
          });

          const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });

          const response = await POST(request);
          const data = await response.json();

          // Should return 401 status
          expect(response.status).toBe(401);
          expect(data.success).toBe(false);
          expect(data.error.code).toBe('UNAUTHORIZED');
          expect(data.error.message).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: leather-ecommerce-platform, Property 29: Valid Authentication Success
   * **Validates: Requirements 12.2**
   * 
   * For any valid admin credentials, the authentication should succeed and grant
   * access to the admin dashboard.
   */
  it('should accept all valid credentials with 200 status and user data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 50 }),
          password: fc.string({ minLength: 1, maxLength: 100 }),
          userId: fc.uuid(),
        }),
        async ({ username, password, userId }) => {
          // Mock auth service to return success
          (authService.login as jest.Mock).mockResolvedValue({
            success: true,
            user: {
              id: userId,
              username: username,
            },
          });

          const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });

          const response = await POST(request);
          const data = await response.json();

          // Should return 200 status
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.data.user).toBeDefined();
          expect(data.data.user.id).toBe(userId);
          expect(data.data.user.username).toBe(username);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Missing Required Fields Validation
   * **Validates: Requirements 12.3**
   * 
   * For any login attempt with missing username or password, the system should
   * return a validation error with 400 status.
   */
  it('should reject requests with missing username or password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Missing username
          fc.record({
            password: fc.string({ minLength: 1 }),
          }),
          // Missing password
          fc.record({
            username: fc.string({ minLength: 1 }),
          }),
          // Missing both
          fc.constant({})
        ),
        async (body) => {
          const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify(body),
          });

          const response = await POST(request);
          const data = await response.json();

          // Should return 400 status
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error.code).toBe('VALIDATION_ERROR');
          expect(data.error.details).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty String Validation
   * **Validates: Requirements 12.3**
   * 
   * For any login attempt with empty string username or password, the system
   * should treat them as missing and return a validation error.
   */
  it('should reject requests with empty string credentials', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Empty username
          fc.record({
            username: fc.constant(''),
            password: fc.string({ minLength: 1 }),
          }),
          // Empty password
          fc.record({
            username: fc.string({ minLength: 1 }),
            password: fc.constant(''),
          }),
          // Both empty
          fc.record({
            username: fc.constant(''),
            password: fc.constant(''),
          })
        ),
        async (credentials) => {
          const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });

          const response = await POST(request);
          const data = await response.json();

          // Should return 400 status for validation error
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error.code).toBe('VALIDATION_ERROR');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Response Structure Consistency
   * 
   * For any login request (valid or invalid), the response should always follow
   * the standard API response format with success boolean and appropriate data/error.
   */
  it('should always return consistent response structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
          password: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        }),
        fc.boolean(), // success flag for mock
        async (credentials, shouldSucceed) => {
          if (shouldSucceed && credentials.username && credentials.password) {
            (authService.login as jest.Mock).mockResolvedValue({
              success: true,
              user: { id: 'test-id', username: credentials.username },
            });
          } else {
            (authService.login as jest.Mock).mockResolvedValue({
              success: false,
              error: 'Invalid credentials',
            });
          }

          const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });

          const response = await POST(request);
          const data = await response.json();

          // Response should always have success field
          expect(data).toHaveProperty('success');
          expect(typeof data.success).toBe('boolean');

          // If success is true, should have data
          if (data.success) {
            expect(data).toHaveProperty('data');
            expect(data.data).toHaveProperty('user');
          } else {
            // If success is false, should have error
            expect(data).toHaveProperty('error');
            expect(data.error).toHaveProperty('code');
            expect(data.error).toHaveProperty('message');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
