'use client';

import { RequireAuth } from '@/providers/sessionProvider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/customComponents/sidebar/app-sidebar';
import { Loader } from '@/customComponents/loader/loader';

export default function WithProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <div className="p-2 md:hidden">
            <SidebarTrigger />
          </div>
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
        </main>
      </SidebarProvider>
    </div>
  );
}
