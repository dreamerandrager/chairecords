'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const KEY = 'navStack';

function readStack(defaultPath: string): string[] {
  if (typeof window === 'undefined') return [defaultPath];
  try {
    const raw = sessionStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {}
  return [defaultPath];
}
// ...imports & constants unchanged

export function useNavStack() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [stack, setStack] = useState<string[]>(readStack(pathname));

  const save = (arr: string[]) => {
    setStack(arr);
    try { sessionStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
  };

  useEffect(() => {
    setStack(prev => {
      const top = prev[prev.length - 1];
      if (top === pathname) return prev;
      const next = [...prev, pathname];
      try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    const onPop = () => {
      const current = window.location.pathname;
      setStack(prev => {
        const idx = prev.lastIndexOf(current);
        const next = idx >= 0 ? prev.slice(0, idx + 1) : [current];
        try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const canGoBack = stack.length > 1;

  // ✅ navigate after state update (not inside it)
  const goBack = () => {
    let target: string | null = null;

    setStack(prev => {
      if (prev.length <= 1) {
        target = '/';
        return prev;
      }
      const next = prev.slice(0, -1);
      target = next[next.length - 1] || '/';
      try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    // defer navigation to after this render pass
    Promise.resolve().then(() => {
      if (!target) return;
      if (target === pathname) return; // already there
      router.replace(target);          // don't grow history while "going back"
    });
  };

  return { canGoBack, goBack, stack };
}
