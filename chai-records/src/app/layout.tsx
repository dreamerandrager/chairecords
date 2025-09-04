import './globals.css';
import type { Metadata } from 'next';
import { SessionProvider } from '../providers/sessionProvider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/customComponents/sidebar/app-sidebar';
import { ThemeProvider } from '@/providers/themeProvider';

export const metadata: Metadata = {
  title: 'Chai Records',
  description: 'Drink reviews with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <ThemeProvider>
          <SessionProvider>
            <SidebarProvider>
              <AppSidebar />
              <main>
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
