'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/supabase';
import { Profile } from '../types/profile';


type SessionContext = {
  session: Session | null;
  user: User | null;
  sessionReady: boolean;
  profile: Profile | null | undefined;
  profileReady: boolean;
  loading: boolean;           
  lastError: string | null;   
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Context = createContext<SessionContext | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [profileReady, setProfileReady] = useState(false);

  const [lastError, setLastError] = useState<string | null>(null);

  // Load session once on mount, then subscribe to auth changes
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);
      setSessionReady(true);

      if (s?.user) {
        setProfile(undefined);
        setProfileReady(false);
        await refreshProfile(); 
      } else {
        setProfile(null);
        setProfileReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession ?? null);

      switch (event) {
        case 'SIGNED_OUT':
          setProfile(null);
          setProfileReady(true);
          break;

        case 'SIGNED_IN':
        case 'USER_UPDATED':
          setProfile(undefined); 
          setProfileReady(false);
          void refreshProfile();
          break;

        case 'TOKEN_REFRESHED':
        case 'INITIAL_SESSION':
        default:
          break;
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    try {
      setLastError(null);
      const u = (await supabase.auth.getUser()).data?.user ?? session?.user;
      if (!u?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, admin, created_at')
        .eq('id', u.id)
        .maybeSingle();

      if (error) {
        setLastError(error.message);
        setProfile(null);
      } else {
        setProfile(data ?? null);
      }
    } catch (e: any) {
      setLastError(e?.message ?? 'Unknown profile error');
      setProfile(null);
    } finally {
      setProfileReady(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileReady(true);
    router.replace('/login');
  };

  const loading = !sessionReady || (!!session?.user && !profileReady);

  const value = useMemo<SessionContext>(() => ({
    session,
    user: session?.user ?? null,
    sessionReady,
    profile,
    profileReady,
    loading,
    lastError,
    refreshProfile,
    signOut,
  }), [session, sessionReady, profile, profileReady, loading, lastError]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSession() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}

export function RequireAuth({
  children,
  requireProfile = false,
  redirectToLogin = '/login',
  redirectToOnboarding = '/create-profile',
  fallback = null,
  showDebug = process.env.NODE_ENV !== 'production',
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
  redirectToLogin?: string;
  redirectToOnboarding?: string;
  fallback?: React.ReactNode;
  showDebug?: boolean; 
}) {
  const { user, profile, sessionReady, profileReady, lastError } = useSession();
  const router = useRouter();

  const decidedRef = useRef(false);
  const [allowed, setAllowed] = useState(false);
  const [reason, setReason] = useState<string>('initializing');

  useEffect(() => {
    if (decidedRef.current) return;

    const ready = sessionReady && (!requireProfile || profileReady);
    if (!ready) {
      setReason(!sessionReady ? 'waiting:session' : 'waiting:profile');
      return;
    }

    decidedRef.current = true;

    if (!user) {
      setReason('redirect:login (no user)');
      router.replace(redirectToLogin);
      return;
    }

    if (requireProfile && profile === null) {
      setReason('redirect:onboarding (no profile)');
      router.replace(redirectToOnboarding);
      return;
    }

    setReason('allowed');
    setAllowed(true);
  }, [sessionReady, profileReady, requireProfile, user, profile, router, redirectToLogin, redirectToOnboarding]);

  if (!decidedRef.current || !allowed) {
    return (
      <>
        {fallback}
        {showDebug && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            guard: <code>{reason}</code>
            {lastError ? <> • error: <code>{lastError}</code></> : null}
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
