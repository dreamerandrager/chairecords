import './globals.css';
import type { Metadata } from 'next';
import { SessionProvider } from './_providers/sessionProvider';

export const metadata: Metadata = {
  title: 'Chai Records',
  description: 'Drink reviews with friends',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
