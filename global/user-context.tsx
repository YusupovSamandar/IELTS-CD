'use client';

import { createContext, useContext } from 'react';
import { ExtendedUser } from '@/auth';
import { useSession } from 'next-auth/react';

interface UserContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const user = session?.user || null;
  const isLoading = status === 'loading';

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
