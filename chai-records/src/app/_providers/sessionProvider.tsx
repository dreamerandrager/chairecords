// src/app/_providers/session-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabase';
import type { Session, User } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  admin: boolean | null;
  created_at: string | null;
};

type Profile = ProfileRow | null; // null = loaded & missing; undefined = not loaded yet

type SessionCtx = {
  session: Session | null;
  user: User | null;
  sessionReady: boolean;
  profile: Profile | undefined;
  profileReady: boolean;
  loading: boolean; // true until sessionReady && (no user || profileReady)
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [profileReady, setProfileReady] = useState(false);

  const router = useRouter();

  // Load session once, then subscribe to changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setSessionReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      setSession(newSession ?? null);
      // reset profile loading state when user changes
      setProfile(undefined);
      setProfileReady(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load profile whenever we have (or lose) a user
  useEffect(() => {
    (async () => {
      if (!session?.user) {
        setProfile(null);
        setProfileReady(true);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, admin, created_at')
        .eq('id', session.user.id)
        .maybeSingle();

      setProfile(error ? null : (data ?? null));
      setProfileReady(true);
    })();
  }, [session?.user?.id]);

  const refreshProfile = async () => {
    const user = session?.user;
    if (!user) {
      setProfile(null);
      setProfileReady(true);
      return;
    }
    setProfileReady(false);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, admin, created_at')
      .eq('id', user.id)
      .maybeSingle();
    setProfile(error ? null : (data ?? null));
    setProfileReady(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileReady(true);
    router.replace('/login');
  };

  const loading = !sessionReady || (!!session?.user && !profileReady);

  const value = useMemo<SessionCtx>(() => ({
    session,
    user: session?.user ?? null,
    sessionReady,
    profile,
    profileReady,
    loading,
    refreshProfile,
    signOut,
  }), [session, sessionReady, profile, profileReady, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}

/** Wrap protected pages with this guard. */
export function RequireAuth({
  children,
  requireProfile = false,
  redirectToLogin = '/login',
  redirectToOnboarding = '/create-profile',
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
  redirectToLogin?: string;
  redirectToOnboarding?: string;
}) {
  const { user, profile, sessionReady, profileReady } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionReady) return;                 // wait for session
    if (!user) {                               // not signed in
      router.replace(redirectToLogin);
      return;
    }
    if (requireProfile) {
      if (!profileReady) return;               // wait for profile
      if (profile === null) {                  // loaded & missing
        router.replace(redirectToOnboarding);
      }
    }
  }, [sessionReady, profileReady, user, profile, redirectToLogin, redirectToOnboarding, router]);

  // Hold render until we know what to do
  if (!sessionReady) return null;
  if (!user) return null;
  if (requireProfile && !profileReady) return null;
  if (requireProfile && profile === null) return null;

  return <>{children}</>;
}
