'use server';

import { revalidatePath } from 'next/cache';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

export const removeAudio = async (assessmentId: string) => {
  try {
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }

    // Get the current audio path from database
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: { audioPath: true }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // If there's an audio path, remove the file
    if (assessment.audioPath) {
      // Extract filename from API path (e.g., /api/files/audio/filename.mp3 -> filename.mp3)
      const fileName = assessment.audioPath.split('/').pop();
      if (fileName) {
        const filePath = join(process.cwd(), 'uploads', 'audio', fileName);

        // Check if file exists and remove it
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
            console.log('Audio file removed:', filePath);
          } catch (error) {
            console.error('Error removing audio file:', error);
            // Continue to update database even if file removal fails
          }
        }
      }
    }

    // Update database to remove audio path
    await db.$executeRaw`
      UPDATE "Assessment" 
      SET "audioPath" = NULL
      WHERE "id" = ${assessmentId}
    `;

    revalidatePath(`/assessments/${assessmentId}`);

    return {
      success: true,
      message: 'Audio removed successfully'
    };
  } catch (error) {
    console.error('Error removing audio:', error);
    throw error;
  }
};
