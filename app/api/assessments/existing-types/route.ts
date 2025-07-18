import { NextRequest, NextResponse } from 'next/server';
import { currentRole } from '@/actions/auth/user';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Admin-only endpoint
    const role = await currentRole();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get distinct section types that already exist
    const existingAssessments = await db.assessment.findMany({
      select: {
        sectionType: true
      },
      distinct: ['sectionType']
    });

    const existingTypes = existingAssessments.map(assessment => assessment.sectionType);

    return NextResponse.json({ existingTypes });
  } catch (error) {
    console.error('Error fetching existing assessment types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch existing types' },
      { status: 500 }
    );
  }
}
