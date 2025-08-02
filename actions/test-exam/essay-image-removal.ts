'use server';

import { revalidatePath } from 'next/cache';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

export const removeEssayImage = async (essayPartId: string) => {
  try {
    if (!essayPartId) {
      throw new Error('Essay part ID is required');
    }

    // Get the current image path from database
    const essayPart = await db.essayPart.findUnique({
      where: { id: essayPartId },
      select: { image: true }
    });

    if (!essayPart) {
      throw new Error('Essay part not found');
    }

    // If there's an image path, remove the file
    if (essayPart.image) {
      // Extract filename from API path (e.g., /api/files/images/filename.jpg -> filename.jpg)
      const fileName = essayPart.image.split('/').pop();
      if (fileName) {
        const filePath = join(process.cwd(), 'uploads', 'images', fileName);

        // Check if file exists and remove it
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
            console.log('Image file removed:', filePath);
          } catch (error) {
            console.error('Error removing image file:', error);
            // Continue to update database even if file removal fails
          }
        }
      }
    }

    // Update database to remove image path
    await db.essayPart.update({
      where: { id: essayPartId },
      data: { image: null }
    });

    revalidatePath(`/assessments`);

    return {
      success: true,
      message: 'Image removed successfully'
    };
  } catch (error) {
    console.error('Error removing image:', error);
    throw error;
  }
};
