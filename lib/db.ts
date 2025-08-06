import { PrismaClient } from '@prisma/client';
import { logDatabaseConfig, setActiveDatabaseUrls } from './database-config';

declare global {
  var prisma: PrismaClient | undefined;
}

// Set the active database URLs based on the provider
setActiveDatabaseUrls();

// Log current database configuration in development
if (process.env.NODE_ENV === 'development') {
  logDatabaseConfig();
}

// Create Prisma client with enhanced configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty'
  });
};

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
