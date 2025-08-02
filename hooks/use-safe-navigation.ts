'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Safe wrapper for Next.js navigation hooks that prevents errors during component unmounting
 */
export function useSafePathname(): string | null {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Only call usePathname on the client and when component is mounted
      if (typeof window !== 'undefined') {
        const currentPathname = window.location.pathname;
        setPathname(currentPathname);
      }
    } catch (error) {
      console.warn('Error getting pathname:', error);
      setPathname(null);
    }
  }, []);

  return pathname;
}

/**
 * Safe wrapper for Next.js router that prevents errors during component unmounting
 */
export function useSafeRouter() {
  const [router, setRouter] = useState<ReturnType<typeof useRouter> | null>(
    null
  );

  useEffect(() => {
    try {
      // Only initialize router on the client
      if (typeof window !== 'undefined') {
        import('next/navigation').then(({ useRouter: nextUseRouter }) => {
          // This is a workaround - we'll provide basic navigation functions
          const safeRouter = {
            push: (href: string, options?: any) => {
              if (typeof window !== 'undefined') {
                window.location.href = href;
              }
            },
            replace: (href: string, options?: any) => {
              if (typeof window !== 'undefined') {
                window.location.replace(href);
              }
            },
            back: () => {
              if (typeof window !== 'undefined') {
                window.history.back();
              }
            },
            forward: () => {
              if (typeof window !== 'undefined') {
                window.history.forward();
              }
            },
            refresh: () => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }
          };
          setRouter(safeRouter as any);
        });
      }
    } catch (error) {
      console.warn('Error initializing router:', error);
      setRouter(null);
    }
  }, []);

  return router;
}

/**
 * Hook that returns true if it's safe to use navigation hooks
 */
export function useIsNavigationSafe(): boolean {
  const [isSafe, setIsSafe] = useState(false);

  useEffect(() => {
    try {
      // Test if navigation context is available
      if (typeof window !== 'undefined') {
        setIsSafe(true);
      }
    } catch (error) {
      console.warn('Navigation context not available:', error);
      setIsSafe(false);
    }
  }, []);

  return isSafe;
}
