import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'uploads', 'audio', filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = readFileSync(fullPath);

    // Get file extension to determine content type
    const extension = filePath.split('.').pop()?.toLowerCase();

    let contentType = 'audio/mpeg'; // Default to MP3
    switch (extension) {
      case 'mp3':
        contentType = 'audio/mpeg';
        break;
      case 'wav':
        contentType = 'audio/wav';
        break;
      case 'ogg':
        contentType = 'audio/ogg';
        break;
      case 'm4a':
        contentType = 'audio/mp4';
        break;
      default:
        contentType = 'audio/mpeg';
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Accept-Ranges': 'bytes'
      }
    });
  } catch (error) {
    console.error('Error serving audio file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
