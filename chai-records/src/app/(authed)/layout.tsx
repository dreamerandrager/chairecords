'use client';

import { RequireAuth } from '@/providers/sessionProvider';
import { Loader } from '@/customComponents/loader/loader';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth
      fallback={
        <div className="grid min-h-svh place-items-center">
          <Loader variant="inline" message="Loading…" />
        </div>
      }
    >
      <main className="min-h-svh">{children}</main>
    </RequireAuth>
  );
}
