import { POST } from '../login/route';
import { authService } from '@/src/server/services/auth.service';
import { NextRequest } from 'next/server';

// Mock auth service
jest.mock('@/src/server/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe('POST /api/admin/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success with user data for valid credentials', async () => {
    const mockUser = {
      id: 'admin-id-123',
      username: 'admin',
    };

    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user).toEqual(mockUser);
    expect(data.data.message).toBe('Login successful');
  });

  it('should return validation error when username is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        password: 'admin123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details.username).toBe('Username is required');
  });

  it('should return validation error when password is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details.password).toBe('Password is required');
  });

  it('should return validation error when both username and password are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details.username).toBe('Username is required');
    expect(data.error.details.password).toBe('Password is required');
  });

  it('should return unauthorized error for invalid credentials', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongPassword',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
    expect(data.error.message).toBe('اسم المستخدم أو كلمة المرور غير صحيحة');
  });

  it('should handle service errors gracefully', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('SERVER_ERROR');
    expect(data.error.message).toBe('Authentication failed');
  });

  it('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('SERVER_ERROR');
  });
});
