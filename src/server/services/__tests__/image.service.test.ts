import { ImageService } from '../image.service';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Mock fs and sharp
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

jest.mock('sharp');

describe('ImageService', () => {
  let imageService: ImageService;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockSharp = sharp as jest.MockedFunction<typeof sharp>;

  beforeEach(() => {
    imageService = new ImageService();
    jest.clearAllMocks();

    // Setup default sharp mock chain
    const mockSharpInstance = {
      webp: jest.fn().mockReturnThis(),
      resize: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('optimized')),
    };
    mockSharp.mockReturnValue(mockSharpInstance as any);
  });

  describe('upload', () => {
    const validFile = {
      buffer: Buffer.from('test image data'),
      originalName: 'test-image.jpg',
      mimeType: 'image/jpeg',
    };

    const uploadOptions = {
      folder: 'products',
    };

    it('should upload and optimize an image successfully', async () => {
      const result = await imageService.upload(validFile, uploadOptions);

      // Should create directories
      expect(mockFs.mkdir).toHaveBeenCalledTimes(3);

      // Should write original file
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('original'),
        validFile.buffer
      );

      // Should write optimized file
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('optimized'),
        expect.any(Buffer)
      );

      // Should return URL
      expect(result.url).toMatch(/\/uploads\/products\/optimized\/.+\.webp$/);
      expect(result.thumbnailUrl).toBeUndefined();
    });

    it('should generate thumbnail when requested', async () => {
      const optionsWithThumbnail = {
        ...uploadOptions,
        generateThumbnail: true,
        thumbnailWidth: 200,
        thumbnailHeight: 200,
      };

      const result = await imageService.upload(validFile, optionsWithThumbnail);

      // Should write thumbnail file
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('thumbnails'),
        expect.any(Buffer)
      );

      // Should return thumbnail URL
      expect(result.thumbnailUrl).toMatch(
        /\/uploads\/products\/thumbnails\/.+-thumb\.webp$/
      );
    });

    it('should use default thumbnail dimensions when not specified', async () => {
      const optionsWithThumbnail = {
        ...uploadOptions,
        generateThumbnail: true,
      };

      await imageService.upload(validFile, optionsWithThumbnail);

      // Should call resize with default dimensions (300x300)
      const mockSharpInstance = mockSharp.mock.results[1].value;
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(300, 300, {
        fit: 'cover',
        position: 'center',
      });
    });

    it('should reject invalid file type', async () => {
      const invalidFile = {
        ...validFile,
        mimeType: 'application/pdf',
      };

      await expect(
        imageService.upload(invalidFile, uploadOptions)
      ).rejects.toThrow('Invalid file type');
    });

    it('should reject file exceeding size limit', async () => {
      const largeFile = {
        ...validFile,
        buffer: Buffer.alloc(11 * 1024 * 1024), // 11MB
      };

      await expect(
        imageService.upload(largeFile, uploadOptions)
      ).rejects.toThrow('File size exceeds maximum');
    });

    it('should accept all allowed MIME types', async () => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];

      for (const mimeType of allowedTypes) {
        const file = { ...validFile, mimeType };
        await expect(
          imageService.upload(file, uploadOptions)
        ).resolves.toBeDefined();
      }
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const result1 = await imageService.upload(validFile, uploadOptions);
      const result2 = await imageService.upload(validFile, uploadOptions);

      expect(result1.url).not.toBe(result2.url);
    });

    it('should preserve original file extension in original folder', async () => {
      await imageService.upload(validFile, uploadOptions);

      const originalWriteCall = (mockFs.writeFile as jest.Mock).mock.calls.find(
        (call) => call[0].includes('original')
      );

      expect(originalWriteCall[0]).toMatch(/\.jpg$/);
    });

    it('should convert optimized images to WebP format', async () => {
      await imageService.upload(validFile, uploadOptions);

      const optimizedWriteCall = (mockFs.writeFile as jest.Mock).mock.calls.find(
        (call) => call[0].includes('optimized')
      );

      expect(optimizedWriteCall[0]).toMatch(/\.webp$/);
    });
  });

  describe('optimize', () => {
    it('should optimize image with WebP format and quality 85', async () => {
      const buffer = Buffer.from('test image');
      await imageService.optimize(buffer);

      expect(mockSharp).toHaveBeenCalledWith(buffer);
      const mockSharpInstance = mockSharp.mock.results[0].value;
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 85 });
      expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with specified dimensions', async () => {
      const buffer = Buffer.from('test image');
      await imageService.generateThumbnail(buffer, 150, 150);

      expect(mockSharp).toHaveBeenCalledWith(buffer);
      const mockSharpInstance = mockSharp.mock.results[0].value;
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(150, 150, {
        fit: 'cover',
        position: 'center',
      });
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 85 });
    });

    it('should use cover fit to maintain aspect ratio', async () => {
      const buffer = Buffer.from('test image');
      await imageService.generateThumbnail(buffer, 200, 300);

      const mockSharpInstance = mockSharp.mock.results[0].value;
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(
        200,
        300,
        expect.objectContaining({ fit: 'cover' })
      );
    });
  });

  describe('delete', () => {
    it('should delete all versions of an image', async () => {
      const url = '/uploads/products/optimized/test-image-123.webp';

      await imageService.delete(url);

      // Should attempt to delete optimized version
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('optimized')
      );
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-image-123.webp')
      );

      // Should attempt to delete thumbnail
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('thumbnails')
      );
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-image-123-thumb.webp')
      );

      // Should attempt to delete original with various extensions
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('original')
      );
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-image-123')
      );
    });

    it('should handle missing files gracefully', async () => {
      mockFs.unlink.mockRejectedValue(new Error('File not found'));

      const url = '/uploads/products/optimized/test-image-123.webp';

      // Should not throw error
      await expect(imageService.delete(url)).resolves.toBeUndefined();
    });

    it('should try multiple extensions for original file', async () => {
      const url = '/uploads/products/optimized/test-image-123.webp';

      // Mock unlink to fail for first few attempts, then succeed
      mockFs.unlink
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(undefined);

      await imageService.delete(url);

      // Should try multiple extensions
      const unlinkCalls = (mockFs.unlink as jest.Mock).mock.calls;
      const originalCalls = unlinkCalls.filter((call) =>
        call[0].includes('original')
      );

      // Should have tried at least 2 extensions before succeeding
      expect(originalCalls.length).toBeGreaterThanOrEqual(2);
    });

    it('should parse URL correctly to extract folder and filename', async () => {
      const url = '/uploads/gallery/optimized/my-photo-456.webp';

      await imageService.delete(url);

      // Should use correct folder
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('gallery')
      );

      // Should use correct filename
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('my-photo-456')
      );
    });
  });

  describe('edge cases', () => {
    it('should handle files with multiple dots in filename', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalName: 'my.test.image.jpg',
        mimeType: 'image/jpeg',
      };

      const result = await imageService.upload(file, { folder: 'products' });

      expect(result.url).toBeDefined();
      expect(result.url).toMatch(/\.webp$/);
    });

    it('should handle files with no extension', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalName: 'image',
        mimeType: 'image/jpeg',
      };

      const result = await imageService.upload(file, { folder: 'products' });

      expect(result.url).toBeDefined();
    });

    it('should handle special characters in filename', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalName: 'test image (1) [copy].jpg',
        mimeType: 'image/jpeg',
      };

      const result = await imageService.upload(file, { folder: 'products' });

      expect(result.url).toBeDefined();
    });
  });
});
