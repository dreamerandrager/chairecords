'use client';

import { RequireAuth } from '@/providers/sessionProvider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/customComponents/sidebar/app-sidebar';
import { Loader } from '@/customComponents/loader/loader';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useLayoutEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function WithProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const pageHeading = useMemo(() => {
  const first = (pathname ?? '')
    .split('?')[0]
    .split('/')
    .filter(Boolean)[0] ?? 'home';

  return first
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Home';
}, [pathname]);

const isCreateReview = useMemo(() => {
  const p = (pathname ?? '').split('?')[0].replace(/\/+$/,'');
  return p === '/create-review';
}, [pathname]);


  // Measure header height and set CSS var on <main>
  useLayoutEffect(() => {
    const el = mainRef.current;
    const header = headerRef.current;
    if (!el || !header) return;

    const update = () => {
      // +8px to account for `top-2`
      const offset = header.offsetHeight + 8;
      el.style.setProperty('--app-header-offset', `${offset}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main ref={mainRef} className="relative flex-1">
        {/* Absolutely positioned header */}
        <div ref={headerRef} className="absolute inset-x-0 top-2 z-20">
          <div className="mx-2 grid grid-cols-[auto_1fr_auto] items-center">
            <SidebarTrigger className="size-7" />
            <h1 className="text-center text-sm font-semibold">Chai Records</h1>
            <div className="size-7" aria-hidden />
          </div>
          <div className="mt-2 px-4">
            <h2 className="text-center text-base font-medium text-muted-foreground">
              {pageHeading}
            </h2>
          </div>
        </div>

        {/* Content area always sits below header */}
        <div
          className="px-4"
          style={{
            // fallback 96px + iOS safe area; adjust fallback if your header gets taller
            paddingTop: 'calc(var(--app-header-offset, 96px) + env(safe-area-inset-top))',
          }}
        >
          <div className="min-h-svh">
            <RequireAuth
              requireProfile
              fallback={
                <div className="grid min-h-[60vh] place-items-center">
                  <Loader variant="inline" message="Loading…" />
                </div>
              }
            >
              {children}

              {/* Floating + Create Review button */}
              {!isCreateReview && (
                <div className="fixed bottom-8 right-8 z-50">
                  <Button
                    aria-label="Create Review"
                    className="inline-flex items-center justify-center rounded-full shadow-lg h-14 aspect-square p-0
                              sm:h-10 sm:aspect-auto sm:px-4 sm:gap-2"
                    onClick={() => router.push('/create-review')}
                  >
                    <Plus className="size-6" />
                    <span className="inline text-lg sm:text-sm">Add Review</span>
                  </Button>
                </div>
              )}
            </RequireAuth>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
