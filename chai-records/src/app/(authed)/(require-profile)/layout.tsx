'use client';

import { RequireAuth } from '@/providers/sessionProvider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/customComponents/sidebar/app-sidebar';
import { Loader } from '@/customComponents/loader/loader';

export default function WithProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex-1">
        <SidebarTrigger className="absolute top-2 left-2 z-20" />

        <div className="min-h-svh grid place-items-center px-4">
          <RequireAuth
            requireProfile
            fallback={
              <div className="grid min-h-[60vh] place-items-center">
                <Loader variant="inline" message="Loading…" />
              </div>
            }
          >
            {children}
          </RequireAuth>
        </div>
      </main>
    </SidebarProvider>
  );
}
