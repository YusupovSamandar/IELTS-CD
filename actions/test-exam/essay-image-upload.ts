'use server';

import { revalidatePath } from 'next/cache';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';

export const uploadEssayImage = async (formData: FormData) => {
  try {
    const file = formData.get('image') as File;
    const essayPartId = formData.get('essayPartId') as string;

    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!essayPartId) {
      throw new Error('Essay part ID is required');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    // Also check file extension as a fallback
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      throw new Error(
        'Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.'
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Create writing directory if it doesn't exist
    const writingDir = join(process.cwd(), 'public', 'writing');
    if (!existsSync(writingDir)) {
      mkdirSync(writingDir, { recursive: true });
    }

    // Generate a unique filename with essay part ID
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${essayPartId}_${Date.now()}.${fileExtension}`;
    const filePath = join(writingDir, uniqueFileName);

    // Write the file
    await writeFile(filePath, buffer);

    // Return the file path relative to public directory
    const publicPath = `/writing/${uniqueFileName}`;

    // Save image path to database
    await saveEssayImagePath({
      essayPartId,
      imagePath: publicPath
    });

    return {
      message: 'Image uploaded successfully',
      filePath: publicPath,
      fileName: uniqueFileName
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const saveEssayImagePath = async ({
  essayPartId,
  imagePath
}: {
  essayPartId: string;
  imagePath: string;
}) => {
  try {
    const essayPart = await db.essayPart.findUnique({
      where: { id: essayPartId },
      select: { id: true }
    });

    if (!essayPart) {
      throw new Error('Essay part not found');
    }

    // Update the essay part with the image path
    await db.essayPart.update({
      where: { id: essayPartId },
      data: { image: imagePath }
    });

    revalidatePath(`/assessments`);
    return { success: true };
  } catch (error) {
    console.error('Error saving image path:', error);
    throw error;
  }
};
