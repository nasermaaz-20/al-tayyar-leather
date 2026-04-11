import { authService } from '../auth.service';
import { prisma } from '@/src/server/db/prisma';
import bcrypt from 'bcrypt';

// Mock Prisma
jest.mock('@/src/server/db/prisma', () => ({
  prisma: {
    admin: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hash = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.verifyPassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'wrongPassword';
      const hash = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.verifyPassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should return success with user data for valid credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'admin123',
      };

      const mockAdmin = {
        id: 'admin-id-123',
        username: 'admin',
        passwordHash: 'hashedPassword',
      };

      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 'admin-id-123',
        username: 'admin',
      });
      expect(result.error).toBeUndefined();
    });

    it('should return error for non-existent username', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123',
      };

      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeUndefined();
    });

    it('should return error for invalid password', async () => {
      const credentials = {
        username: 'admin',
        password: 'wrongPassword',
      };

      const mockAdmin = {
        id: 'admin-id-123',
        username: 'admin',
        passwordHash: 'hashedPassword',
      };

      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      const credentials = {
        username: 'admin',
        password: 'admin123',
      };

      (prisma.admin.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
      expect(result.user).toBeUndefined();
    });
  });

  describe('getAdminByUsername', () => {
    it('should return admin user by username', async () => {
      const mockAdmin = {
        id: 'admin-id-123',
        username: 'admin',
        passwordHash: 'hashedPassword',
      };

      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await authService.getAdminByUsername('admin');

      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { username: 'admin' },
        select: {
          id: true,
          username: true,
          passwordHash: true,
        },
      });
      expect(result).toEqual(mockAdmin);
    });

    it('should return null for non-existent username', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authService.getAdminByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAdminById', () => {
    it('should return admin user by ID', async () => {
      const mockAdmin = {
        id: 'admin-id-123',
        username: 'admin',
      };

      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await authService.getAdminById('admin-id-123');

      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-id-123' },
        select: {
          id: true,
          username: true,
        },
      });
      expect(result).toEqual(mockAdmin);
    });

    it('should return null for non-existent ID', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authService.getAdminById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
