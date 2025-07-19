'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = async () => {
    try {
      // Clear storage before logout
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      await signOut({
        callbackUrl: '/auth/login',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to direct navigation
      window.location.href = '/auth/login';
    }
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
