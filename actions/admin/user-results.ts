'use server';

import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export async function getUserResults({ query }: { query?: string }) {
  const whereCondition: Prisma.UserWhereInput = {};

  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ];
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

export type UsersWithResults = Prisma.PromiseReturnType<typeof getUserResults>;
