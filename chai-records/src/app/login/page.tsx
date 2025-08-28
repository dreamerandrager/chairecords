'use client';
import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });
    setBusy(false);
    if (error) alert(error.message);
    else alert('Magic link sent!');
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
      <input className="w-full rounded border p-2" placeholder="email@example.com"
             value={email} onChange={(e)=>setEmail(e.target.value)} />
      <button className="mt-3 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={busy || !email} onClick={signIn}>
        {busy ? 'Sending…' : 'Send magic link'}
      </button>
    </div>
  );
}
