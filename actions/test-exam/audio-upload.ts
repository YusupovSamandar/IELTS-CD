'use server';

import { revalidatePath } from 'next/cache';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';

export const uploadAudio = async (formData: FormData) => {
  try {
    const file = formData.get('audio') as File;
    const assessmentId = formData.get('assessmentId') as string;

    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!assessmentId) {
      throw new Error('Assessment ID is required');
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
      throw new Error(
        'Invalid file type. Please upload MP3, WAV, OGG, or M4A files only.'
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Create listening directory if it doesn't exist
    const listeningDir = join(process.cwd(), 'public', 'listening');
    if (!existsSync(listeningDir)) {
      mkdirSync(listeningDir, { recursive: true });
    }

    // Generate a unique filename with assessment ID
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${assessmentId}_${Date.now()}.${fileExtension}`;
    const filePath = join(listeningDir, uniqueFileName);

    // Write the file
    await writeFile(filePath, buffer);

    // Return the file path relative to public directory
    const publicPath = `/listening/${uniqueFileName}`;

    // Save audio path to database
    await saveAudioPath({
      assessmentId,
      audioPath: publicPath
    });

    return {
      message: 'File uploaded successfully',
      filePath: publicPath,
      fileName: uniqueFileName
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const saveAudioPath = async ({
  assessmentId,
  audioPath
}: {
  assessmentId: string;
  audioPath: string;
}) => {
  try {
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Use $executeRaw to bypass TypeScript type checking
    await db.$executeRaw`
      UPDATE "Assessment" 
      SET "audioPath" = ${audioPath}
      WHERE "id" = ${assessmentId}
    `;

    revalidatePath(`/assessments/${assessmentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error saving audio path:', error);
    throw error;
  }
};
