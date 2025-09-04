'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/utils/supabase/supabase';
import type { Session, User } from '@supabase/supabase-js';

import { Profile } from '../types/profile';

type SessionContext = {
  session: Session | null;
  user: User | null;
  sessionReady: boolean;
  profile: Profile | undefined;
  profileReady: boolean;
  loading: boolean; 
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Context = createContext<SessionContext | null>(null);

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

  const value = useMemo<SessionContext>(() => ({
    session,
    user: session?.user ?? null,
    sessionReady,
    profile,
    profileReady,
    loading,
    refreshProfile,
    signOut,
  }), [session, sessionReady, profile, profileReady, loading]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error('useSession must be used within <SessionProvider>');
  return context;
}

// Wrap protected pages with this guard. 
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
    if (!sessionReady) return;                
    if (!user) {                               
      router.replace(redirectToLogin);
      return;
    }
    if (requireProfile) {
      if (!profileReady) return;              
      if (profile === null) {                
        router.replace(redirectToOnboarding);
      }
    }
  }, [sessionReady, profileReady, user, profile, redirectToLogin, redirectToOnboarding, router]);

  if (!sessionReady) return null;
  if (!user) return null;
  if (requireProfile && !profileReady) return null;
  if (requireProfile && profile === null) return null;

  return <>{children}</>;
}
