import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const partId = formData.get('partId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!partId) {
      return NextResponse.json(
        { error: 'Part ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg', // MP3 files
      'audio/mp3', // Some systems might use this
      'audio/wav', // WAV files
      'audio/ogg', // OGG files
      'audio/mp4', // M4A files (audio/mp4)
      'audio/m4a', // M4A files (alternative)
      'audio/x-m4a' // M4A files (alternative)
    ];

    // Also check file extension as a fallback
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Please upload MP3, WAV, OGG, or M4A files only.'
        },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Create listening directory if it doesn't exist
    const listeningDir = join(process.cwd(), 'public', 'listening');
    if (!existsSync(listeningDir)) {
      mkdirSync(listeningDir, { recursive: true });
    }

    // Generate a unique filename with part ID
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${partId}_${Date.now()}.${fileExtension}`;
    const filePath = join(listeningDir, uniqueFileName);

    // Write the file
    await writeFile(filePath, buffer);

    // Return the file path relative to public directory
    const publicPath = `/listening/${uniqueFileName}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      filePath: publicPath,
      fileName: uniqueFileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
