import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const assessmentId = formData.get('assessmentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
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

    // Create uploads/audio directory if it doesn't exist (outside public folder)
    const audioDir = join(process.cwd(), 'uploads', 'audio');
    if (!existsSync(audioDir)) {
      mkdirSync(audioDir, { recursive: true });
    }

    // Generate a unique filename with assessment ID
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${assessmentId}_${Date.now()}.${fileExtension}`;
    const filePath = join(audioDir, uniqueFileName);

    // Write the file
    await writeFile(filePath, buffer);

    // Return the file path for API route serving
    const apiPath = `/api/files/audio/${uniqueFileName}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      filePath: apiPath,
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
