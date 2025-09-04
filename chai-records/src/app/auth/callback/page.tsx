'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/utils/supabase/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (!mounted) return;

      if (error) {
        setMsg(`Sign-in failed: ${error.message}`);
        return;
      }

      try {
        window.history.replaceState({}, '', '/');
      } catch {}

      router.replace('/home');
    })();

    return () => { mounted = false; };
  }, [router]);

  return <div className="p-6">{msg}</div>;
}
