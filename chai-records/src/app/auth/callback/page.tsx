'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import { Loader } from '@/customComponents/loader/loader';

export default function AuthCallback() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // This parses the current URL (?code=...) and handles PKCE for you
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        setErr(error.message);
        return;
      }
      // success → go to your authed landing page
      router.replace('/home');
    })();
  }, [router]);

  return (
    <div className="grid min-h-svh place-items-center">
      <div className="text-center">
        <Loader variant="inline" message="Signing you in…" />
        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      </div>
    </div>
  );
}
