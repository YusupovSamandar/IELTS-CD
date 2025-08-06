// Database configuration manager
// This file handles switching between different database environments

export type DatabaseProvider = 'supabase' | 'local' | 'production';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  url: string;
  directUrl: string;
  name: string;
  description: string;
}

// Database configurations
export const databaseConfigs: Record<DatabaseProvider, DatabaseConfig> = {
  supabase: {
    provider: 'supabase',
    url: process.env.SUPABASE_DATABASE_URL || '',
    directUrl: process.env.SUPABASE_DIRECT_URL || '',
    name: 'Supabase Cloud',
    description: 'Supabase hosted PostgreSQL database'
  },
  local: {
    provider: 'local',
    url:
      process.env.LOCAL_DATABASE_URL ||
      'postgresql://ieltstrek_user:ieltstrek_local_password@localhost:5433/ieltstrek',
    directUrl:
      process.env.LOCAL_DIRECT_URL ||
      'postgresql://ieltstrek_user:ieltstrek_local_password@localhost:5433/ieltstrek',
    name: 'Local Docker PostgreSQL',
    description: 'Local PostgreSQL database running in Docker (Port 5433)'
  },
  production: {
    provider: 'production',
    url: process.env.PRODUCTION_DATABASE_URL || '',
    directUrl: process.env.PRODUCTION_DIRECT_URL || '',
    name: 'Production Database',
    description: 'Production PostgreSQL database'
  }
};

// Get current database provider from environment
export function getCurrentDatabaseProvider(): DatabaseProvider {
  const provider = process.env.DATABASE_PROVIDER as DatabaseProvider;

  // Default to local if not specified or invalid
  if (!provider || !databaseConfigs[provider]) {
    console.warn(
      `Invalid or missing DATABASE_PROVIDER: ${provider}. Defaulting to 'local'.`
    );
    return 'local';
  }

  return provider;
}

// Get current database configuration
export function getCurrentDatabaseConfig(): DatabaseConfig {
  const provider = getCurrentDatabaseProvider();
  const config = databaseConfigs[provider];

  // Validate URLs are provided
  if (!config.url || !config.directUrl) {
    throw new Error(
      `Database configuration incomplete for provider '${provider}'. ` +
        `Please check your environment variables.`
    );
  }

  return config;
}

// Get database URLs for Prisma
export function getDatabaseUrls() {
  const provider = getCurrentDatabaseProvider();
  const config = getCurrentDatabaseConfig();

  // Override with the specific provider URLs if available
  let databaseUrl = config.url;
  let directUrl = config.directUrl;

  // Fallback to generic DATABASE_URL/DIRECT_URL if specific ones aren't set
  if (!databaseUrl) {
    databaseUrl = process.env.DATABASE_URL || '';
  }
  if (!directUrl) {
    directUrl = process.env.DIRECT_URL || '';
  }

  return {
    DATABASE_URL: databaseUrl,
    DIRECT_URL: directUrl
  };
}

// Update environment variables for the current session (for Prisma)
export function setActiveDatabaseUrls() {
  const provider = getCurrentDatabaseProvider();

  switch (provider) {
    case 'local':
      process.env.DATABASE_URL = process.env.LOCAL_DATABASE_URL;
      process.env.DIRECT_URL = process.env.LOCAL_DIRECT_URL;
      break;
    case 'supabase':
      process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
      process.env.DIRECT_URL = process.env.SUPABASE_DIRECT_URL;
      break;
    case 'production':
      process.env.DATABASE_URL = process.env.PRODUCTION_DATABASE_URL;
      process.env.DIRECT_URL = process.env.PRODUCTION_DIRECT_URL;
      break;
  }
}

// Log current database configuration (for debugging)
export function logDatabaseConfig() {
  const config = getCurrentDatabaseConfig();
  console.log(`🗄️  Database Provider: ${config.name} (${config.provider})`);
  console.log(`📝 Description: ${config.description}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `🔗 Database URL: ${config.url.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`
    );
  }
}

// Validate database connection (utility function)
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$connect();
    await prisma.$disconnect();

    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
