'use client';
import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles').select('display_name, admin').eq('id', session.user.id).maybeSingle();
      if (data) { setName(data.display_name); setIsAdmin(!!data.admin); }
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Welcome, {name}</h1>
        <button onClick={signOut} className="rounded border px-3 py-1">Sign out</button>
      </div>
      <p>{isAdmin ? 'You are an admin.' : 'Regular user.'}</p>
    </div>
  );
}
