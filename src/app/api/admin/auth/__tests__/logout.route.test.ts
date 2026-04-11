import { POST } from '../logout/route';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mock next-auth JWT
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('POST /api/admin/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success response when authenticated', async () => {
    // Mock authenticated user
    (getToken as jest.Mock).mockResolvedValue({
      id: 'admin-id-123',
      username: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/auth/logout', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Logout successful');
  });

  it('should return unauthorized error when not authenticated', async () => {
    // Mock unauthenticated user
    (getToken as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/admin/auth/logout', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
    expect(data.error.message).toBe('Authentication required');
  });
});
