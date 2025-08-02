import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'uploads', 'images', filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = readFileSync(fullPath);

    // Get file extension to determine content type
    const extension = filePath.split('.').pop()?.toLowerCase();

    let contentType = 'image/jpeg'; // Default to JPEG
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      default:
        contentType = 'image/jpeg';
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('Error serving image file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
