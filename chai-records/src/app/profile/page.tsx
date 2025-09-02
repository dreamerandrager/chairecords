'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabase';

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  admin: boolean | null;
  created_at: string | null;
} | null;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, admin, created_at')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) setMessage(error.message);

      if (!data) { 
        router.replace('/create-profile');
        return;
      }

      setProfile(data);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      {message && <div className="rounded border p-2 text-sm">{message}</div>}

      <div className="flex items-center gap-4">
        <img
          src={profile?.avatar_url ?? 'https://via.placeholder.com/80?text=Avatar'}
          alt="avatar"
          className="h-20 w-20 rounded-full object-cover border"
        />
        <div className="text-lg font-medium">
          {profile?.display_name ?? 'New User'}
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div><span className="font-medium">Admin:</span> {profile?.admin ? 'Yes' : 'No'}</div>
        {profile?.created_at && (
          <div>
            <span className="font-medium">Created:</span>{' '}
            {new Date(profile.created_at).toLocaleString()}
          </div>
        )}
      </div>

      {/* If you later want editing, link to a separate /profile/edit route */}
      {/* <Link href="/profile/edit" className="underline">Edit profile</Link> */}
    </div>
  );
}
