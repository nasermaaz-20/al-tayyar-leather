import bcrypt from 'bcrypt';
import { prisma } from '@/src/server/db/prisma';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
  };
  error?: string;
}

class AuthService {
  private readonly SALT_ROUNDS = 10;

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Authenticate admin user with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { username, password } = credentials;

      // Find admin user by username
      const admin = await prisma.admin.findUnique({
        where: { username },
      });

      if (!admin) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Verify password
      const isValid = await this.verifyPassword(password, admin.passwordHash);

      if (!isValid) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      return {
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * Get admin user by username
   */
  async getAdminByUsername(username: string) {
    return prisma.admin.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
      },
    });
  }

  /**
   * Get admin user by ID
   */
  async getAdminById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
      },
    });
  }
}

export const authService = new AuthService();
