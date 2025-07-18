'use server';

import { revalidatePath } from 'next/cache';
import { currentRole } from '@/actions/auth/user';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z
    .enum(Object.values(UserRole) as [UserRole, ...UserRole[]])
    .default(UserRole.USER)
});

export const createUser = async (
  formData: z.infer<typeof CreateUserSchema>
) => {
  const role = await currentRole();
  if (role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can create users');
  }

  const validatedFields = CreateUserSchema.safeParse(formData);

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { name, email, password, role: userRole } = validatedFields.data;

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userRole as UserRole,
      emailVerified: new Date() // Auto-verify admin created users
    }
  });

  // revalidatePath('/dashboard/admin/users'); // Removed - using client-side refresh
  return { success: true };
};

export const getUsers = async (page = 1, limit = 10) => {
  const role = await currentRole();

  if (role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can view users');
  }

  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    db.user.findMany({
      skip,
      take: limit,
      orderBy: {
        email: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isTwoFactorEnabled: true
      }
    }),
    db.user.count()
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

export const deleteUser = async (userId: string) => {
  const role = await currentRole();

  if (role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can delete users');
  }

  // Prevent admin from deleting themselves
  const currentUser = await db.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (currentUser?.id === userId) {
    throw new Error('You cannot delete your own account');
  }

  await db.user.delete({
    where: { id: userId }
  });

  // revalidatePath('/dashboard/admin/users'); // Removed - using client-side refresh
  return { success: true };
};

export const generateRandomPassword = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
