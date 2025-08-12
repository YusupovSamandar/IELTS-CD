'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Hook to preserve the current tab in URL when actions cause page revalidation
 */
export function useTabPreservation() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getCurrentTab = () => searchParams.get('currentTab');

  const setCurrentTab = (tabId: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('currentTab', tabId);

    // Preserve existing params like mode
    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const preserveCurrentTab = () => {
    const currentTab = getCurrentTab();
    if (currentTab) {
      // Force a reload with the current tab preserved
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('currentTab', currentTab);
        const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
        router.replace(newUrl, { scroll: false });
      }, 100);
    }
  };

  return {
    getCurrentTab,
    setCurrentTab,
    preserveCurrentTab
  };
}
