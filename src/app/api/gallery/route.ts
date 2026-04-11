import { NextResponse } from 'next/server';
import { galleryService } from '@/src/server/services/gallery.service';

/**
 * GET /api/gallery
 * List all gallery images ordered by order field
 */
export async function GET() {
  try {
    // Get all gallery images ordered by order field
    const images = await galleryService.getAll();

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch gallery images',
        },
      },
      { status: 500 }
    );
  }
}
