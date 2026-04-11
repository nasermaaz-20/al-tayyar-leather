import { NextRequest, NextResponse } from 'next/server';
import { GalleryService } from '@/src/server/services/gallery.service';

const galleryService = new GalleryService();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageIds } = body;

    if (!Array.isArray(imageIds)) {
      return NextResponse.json(
        { success: false, error: 'imageIds must be an array' },
        { status: 400 }
      );
    }

    await galleryService.reorder(imageIds);

    return NextResponse.json({
      success: true,
      message: 'Gallery images reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering gallery images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder gallery images' },
      { status: 500 }
    );
  }
}
