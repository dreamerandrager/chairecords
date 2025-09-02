'use client';

import { useRouter } from 'next/navigation';
import { RequireAuth, useSession } from "../_providers/sessionProvider";
import { supabase } from "../utils/supabase/supabase";
import { useEffect } from "react";

export default function Home() {
  return (
    <RequireAuth requireProfile>
      <HomeContent />
    </RequireAuth>
  );
}

function HomeContent() {
  const { profile, signOut } = useSession();
    const router = useRouter();

      function goToProfile() {
        router.replace('/profile');
      }

  async function log() {const { data: { user } } = await supabase.auth.getUser();
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user!.id)
            .maybeSingle();
          console.log("PROFILE", profile)}
    
        useEffect(() => {
          log();
        },[])


  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Welcome, {profile?.display_name ?? 'New User'}
        </h1>
        <button onClick={goToProfile} className="rounded border px-3 py-1">
          Go To Profile
        </button>
        <button onClick={signOut} className="rounded border px-3 py-1">
          Sign out
        </button>
      </div>
      <p>{profile?.admin ? 'You are an admin.' : 'Regular user.'}</p>
    </div>
  );
}

      
    
      