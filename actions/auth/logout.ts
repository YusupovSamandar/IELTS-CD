'use server';

import { signOut } from '@/auth';

export const logout = async () => {
  try {
    await signOut({
      redirect: false
    });
    return { success: 'Logout successful!' };
  } catch (error) {
    console.error('Server-side logout error:', error);
    return { error: 'Logout failed!' };
  }
};
