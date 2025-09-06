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

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: process.env.NEXT_REDIRECT_URL },
    });

    setBusy(false);
    if (error) setErr(error.message);
    else setMsg('Magic link sent. Check your email!');
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold">Sign in</h1>

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

      <Button
        className="mt-4 w-full"
        disabled={busy || !email}
        onClick={signIn}
      >
        {busy ? 'Sending…' : 'Send magic link'}
      </Button>

      {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

      <p className="mt-6 text-xs text-muted-foreground">
        We’ll email you a sign-in link. Click on the link in your email to create an account with us or log into your existing account.
      </p>
    </div>
  );
}
