'use server';

import { redirect } from 'next/navigation';
import { signOut } from '@/auth';

export const logout = async () => {
  try {
    await signOut({
      redirectTo: '/auth/login'
    });
  } catch (error) {
    console.error('Server-side logout error:', error);
    // Force redirect if signOut fails
    redirect('/auth/login');
  }
};
