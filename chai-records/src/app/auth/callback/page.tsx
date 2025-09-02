'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabase'; 

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    (async () => {
      // Supabase redirects with ?code=...&type=magiclink (or verification params)
    //   const code = search.get('code');
    //   if (!code) {
    //     setMsg('No code found. Please request a new link.');
    //     return;
    //   }

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        setMsg(`Sign-in failed: ${error.message}`);
        return;
      }

      // Optional: clean the URL (remove code/type params)
      window.history.replaceState({}, '', '/');

      // If you want to force profile onboarding first, do a quick check:
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user!.id)
        .maybeSingle();

      router.replace(profile ? '/home' : '/create-profile'); // adjust to your routes
    })();
  }, [router, search]);

  return <div className="p-6">{msg}</div>;
}
