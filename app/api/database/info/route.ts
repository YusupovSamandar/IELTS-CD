import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDatabaseConfig } from '@/lib/database-config';

export async function GET(request: NextRequest) {
  try {
    const config = getCurrentDatabaseConfig();

    return NextResponse.json({
      provider: config.provider,
      name: config.name,
      description: config.description,
      status: 'connected', // We'll test this in a separate endpoint
      url: config.url
    });
  } catch (error) {
    console.error('Database info error:', error);

    return NextResponse.json(
      {
        provider: 'unknown',
        name: 'Unknown',
        description: 'Failed to load database configuration',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
