'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackHomeButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push('/')}
      className="gap-2 mr-4 text-muted-foreground hover:text-foreground"
      title="Go back to home page"
    >
      <ArrowLeft className="h-4 w-4" />
      Home
    </Button>
  );
}
