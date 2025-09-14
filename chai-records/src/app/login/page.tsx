'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import { useSession } from '@/providers/sessionProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Login() {
  const router = useRouter();
  const { user, sessionReady } = useSession();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    if (user) router.replace('/home');
  }, [sessionReady, user, router]);

  async function signIn() {
    setBusy(true);
    setMsg(null);
    setErr(null);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo},
    });

    setBusy(false);
    if (error) setErr(error.message);
    else setMsg('Link sent. Check your email!');
  }

  return (
  <div className="min-h-svh grid place-items-center px-4">
    <div className="w-full max-w-sm p-6">
      <h1 className="mb-4 text-3xl text-center font-semibold">Chai Records</h1>
      <h1 className="mb-4 text-xl text-center font-semibold">Sign in</h1>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <Button className="mt-4 w-full" disabled={busy || !email} onClick={signIn}>
        {busy ? 'Sending…' : 'Send link'}
      </Button>

      {msg && <p className="mt-3 text-sm text-center text-muted-foreground">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

      <p className="mt-6 text-xs text-muted-foreground text-center">
        You&apos;ll receive an email from Supabase. Click this link to create an account or log in.
      </p>
    </div>
  </div>
);

}
