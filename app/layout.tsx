import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { GlobalState } from '@/global/global-state';
import { ModalProvider } from '@/global/modal-provider';
import AuthErrorBoundary from '@/components/error-boundary/auth-error-boundary';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IELTS Trek - Computer Delivered Practice',
  description: 'IELTS Computer Delivered Practice App',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IELTS Trek'
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <AuthErrorBoundary>
      <SessionProvider session={session}>
        <html lang="en" suppressHydrationWarning>
          <head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta name="theme-color" content="#2563eb" />
            <link rel="manifest" href="/manifest.json" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta
              name="apple-mobile-web-app-status-bar-style"
              content="default"
            />
            <meta name="apple-mobile-web-app-title" content="IELTS Trek" />
          </head>
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <GlobalState>
                <ModalProvider />

                {children}
              </GlobalState>
              <Toaster closeButton />
            </ThemeProvider>
          </body>
        </html>
      </SessionProvider>
    </AuthErrorBoundary>
  );
}
