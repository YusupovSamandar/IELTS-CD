'use client';

import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackToMainButton() {
  const router = useRouter();

  return (
    <div className="flex justify-center mt-6">
      <Button 
        size="lg" 
        onClick={() => router.push('/')}
        className="gap-2"
      >
        <Home className="h-4 w-4" />
        Go Back to Main Page
      </Button>
    </div>
  );
}
