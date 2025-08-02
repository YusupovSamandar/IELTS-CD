'use server';

import { Prisma, UserRole } from '@prisma/client';
import { db } from '@/lib/db';

export async function getUserResults({ 
  query, 
  role 
}: { 
  query?: string; 
  role?: UserRole;
}) {
  const whereCondition: Prisma.UserWhereInput = {};

  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ];
  }

  if (role) {
    whereCondition.role = role;
  }

  const usersWithResults = await db.user.findMany({
    where: whereCondition,
    include: {
      results: {
        include: {
          assessment: {
            select: {
              id: true,
              name: true,
              sectionType: true
            }
          }
        }
      },
      userEssays: {
        include: {
          assessment: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return usersWithResults;
}

export async function getUserResultsForExport() {
  const usersWithResults = await db.user.findMany({
    where: {
      role: 'USER' // Only export USER role results
    },
    include: {
      results: {
        include: {
          assessment: {
            select: {
              id: true,
              name: true,
              sectionType: true,
              totalQuestions: true
            }
          }
        }
      },
      userEssays: {
        include: {
          assessment: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return usersWithResults;
}

export type UsersWithResults = Prisma.PromiseReturnType<typeof getUserResults>;
