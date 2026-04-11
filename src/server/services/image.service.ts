import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Supported image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  folder: string;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
  url: string;
  thumbnailUrl?: string;
}

/**
 * ImageService handles image upload, optimization, and deletion
 * Uses Sharp for image processing (WebP conversion, compression)
 */
export class ImageService {
  private readonly uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  /**
   * Ensure upload directories exist
   */
  private async ensureDirectories(folder: string): Promise<void> {
    const originalDir = path.join(this.uploadsDir, folder, 'original');
    const optimizedDir = path.join(this.uploadsDir, folder, 'optimized');
    const thumbnailsDir = path.join(this.uploadsDir, folder, 'thumbnails');

    await fs.mkdir(originalDir, { recursive: true });
    await fs.mkdir(optimizedDir, { recursive: true });
    await fs.mkdir(thumbnailsDir, { recursive: true });
  }

  /**
   * Validate file type and size
   */
  private validateFile(buffer: Buffer, mimeType: string): void {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }
  }

  /**
   * Generate a unique filename
   */
  private generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    return `${nameWithoutExt}-${timestamp}-${random}`;
  }

  /**
   * Optimize image using Sharp (WebP conversion, compression)
   * @param buffer Image buffer
   * @returns Optimized image buffer
   */
  async optimize(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();
  }

  /**
   * Generate thumbnail for an image
   * @param buffer Image buffer
   * @param width Thumbnail width
   * @param height Thumbnail height
   * @returns Thumbnail buffer
   */
  async generateThumbnail(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer> {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toBuffer();
  }

  /**
   * Upload and optimize an image
   * @param file File object with buffer, originalName, and mimeType
   * @param options Upload options (folder, thumbnail settings)
   * @returns Upload result with URLs
   */
  async upload(
    file: { buffer: Buffer; originalName: string; mimeType: string },
    options: ImageUploadOptions
  ): Promise<ImageUploadResult> {
    // Validate file
    this.validateFile(file.buffer, file.mimeType);

    // Ensure directories exist
    await this.ensureDirectories(options.folder);

    // Generate filename
    const filename = this.generateFilename(file.originalName);

    // Save original
    const originalPath = path.join(
      this.uploadsDir,
      options.folder,
      'original',
      `${filename}${path.extname(file.originalName)}`
    );
    await fs.writeFile(originalPath, file.buffer);

    // Optimize and save
    const optimizedBuffer = await this.optimize(file.buffer);
    const optimizedFilename = `${filename}.webp`;
    const optimizedPath = path.join(
      this.uploadsDir,
      options.folder,
      'optimized',
      optimizedFilename
    );
    await fs.writeFile(optimizedPath, optimizedBuffer);

    const result: ImageUploadResult = {
      url: `/uploads/${options.folder}/optimized/${optimizedFilename}`,
    };

    // Generate thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnailWidth = options.thumbnailWidth || 300;
      const thumbnailHeight = options.thumbnailHeight || 300;

      const thumbnailBuffer = await this.generateThumbnail(
        file.buffer,
        thumbnailWidth,
        thumbnailHeight
      );

      const thumbnailFilename = `${filename}-thumb.webp`;
      const thumbnailPath = path.join(
        this.uploadsDir,
        options.folder,
        'thumbnails',
        thumbnailFilename
      );
      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      result.thumbnailUrl = `/uploads/${options.folder}/thumbnails/${thumbnailFilename}`;
    }

    return result;
  }

  /**
   * Delete an image from storage
   * Removes original, optimized, and thumbnail versions
   * @param url Image URL (e.g., /uploads/products/optimized/image.webp)
   */
  async delete(url: string): Promise<void> {
    // Parse URL to extract folder and filename
    const urlParts = url.split('/');
    const folder = urlParts[2]; // e.g., 'products'
    const filename = urlParts[urlParts.length - 1]; // e.g., 'image.webp'
    const baseFilename = filename.replace('.webp', '').replace('-thumb', '');

    // Delete optimized version
    const optimizedPath = path.join(
      this.uploadsDir,
      folder,
      'optimized',
      filename
    );
    try {
      await fs.unlink(optimizedPath);
    } catch (error) {
      // File might not exist, continue
    }

    // Delete thumbnail if exists
    const thumbnailPath = path.join(
      this.uploadsDir,
      folder,
      'thumbnails',
      `${baseFilename}-thumb.webp`
    );
    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      // File might not exist, continue
    }

    // Delete original - try common extensions
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    for (const ext of extensions) {
      const originalPath = path.join(
        this.uploadsDir,
        folder,
        'original',
        `${baseFilename}${ext}`
      );
      try {
        await fs.unlink(originalPath);
        break; // Stop after successfully deleting one
      } catch (error) {
        // Try next extension
      }
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();
