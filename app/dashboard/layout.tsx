import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-7xl px-4 flex justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
