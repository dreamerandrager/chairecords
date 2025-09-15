import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/themeProvider';
import { SessionProvider } from '@/providers/sessionProvider';

export const metadata: Metadata = {
  title: 'Chai Records',
  description: 'Review food and drink items and discover new ones!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
