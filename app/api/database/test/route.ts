import { NextRequest, NextResponse } from 'next/server';
import { validateDatabaseConnection } from '@/lib/database-config';

export async function GET(request: NextRequest) {
  try {
    const isConnected = await validateDatabaseConnection();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      },
      { status: 500 }
    );
  }
}
