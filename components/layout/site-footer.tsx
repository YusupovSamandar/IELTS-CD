import Link from 'next/link';
import { Shell } from '@/components/shells/shell';

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <Shell>
        <div className="py-6 text-center text-sm text-muted-foreground">
          Developed by{' '}
          <Link
            href="https://github.com/YusupovSamandar"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            Samandar Yusupov
          </Link>
        </div>
      </Shell>
    </footer>
  );
}
