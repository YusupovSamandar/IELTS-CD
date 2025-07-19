'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';

/**
 * Custom logout function that ensures proper cleanup of all session data
 */
export const logout = async (redirectTo: string = '/auth/login') => {
  try {
    // Clear any client-side storage (but preserve NextAuth cookies)
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
    }

    // Sign out using NextAuth - this will handle cookie cleanup properly
    await nextAuthSignOut({
      callbackUrl: redirectTo,
      redirect: true
    });
  } catch (error) {
    console.error('Logout error:', error);

    // Force redirect to login if signOut fails
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
};

/**
 * Function to check if user is authenticated on client side
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;

  // Check for NextAuth session cookie
  const sessionCookie = document.cookie
    .split(';')
    .find(
      (cookie) =>
        cookie.trim().startsWith('next-auth.session-token=') ||
        cookie.trim().startsWith('__Secure-next-auth.session-token=')
    );

  return !!sessionCookie;
};
