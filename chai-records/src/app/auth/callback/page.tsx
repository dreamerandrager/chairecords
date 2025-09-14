'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';

function parseHashFragment(hash: string) {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    access_token: p.get('access_token'),
    refresh_token: p.get('refresh_token'),
    error: p.get('error_description') || p.get('error'),
  };
}

export default function AuthCallback() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(url.toString());
        if (!error) return router.replace('/home');
      }

      const token_hash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type') as
        | 'magiclink'
        | 'recovery'
        | 'signup'
        | 'email_change'
        | null;
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (!error) return router.replace('/home');
        setErr(error.message);
        return;
      }

      const { access_token, refresh_token, error: hashErr } = parseHashFragment(
        window.location.hash || ''
      );
      if (hashErr) {
        setErr(hashErr);
        return;
      }
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) return router.replace('/home');
        setErr(error.message);
        return;
      }

      setErr('No auth code or tokens found.');
    })();
  }, [router]);

  return (
    <div className="grid min-h-svh place-items-center">
      <div className="text-center">
        <div className="animate-pulse">Signing you in…</div>
        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      </div>
    </div>
  );
}
