'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase/supabase';
import { useRouter } from 'next/navigation';

export default function OnboardingProfile() {
  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('id', session.user.id).maybeSingle();
      if (existing) router.replace('/');
    })();
  }, [router]);

  async function submit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let avatar_url: string | null = null;
    if (file) {
      const path = `user/${user.id}/${crypto.randomUUID()}-${file.name}`;
      const up = await supabase.storage.from('avatars').upload(path, file);
      if (up.error) return alert(up.error.message);
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      avatar_url = data.publicUrl;
    }

    const { error } = await supabase.from('profiles').upsert(
      { id: user.id, display_name: displayName || 'New User', avatar_url },
      { onConflict: 'id' }
    );
    if (error) return alert(error.message);
    router.replace('/');
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-2xl font-semibold">Create your profile</h1>
      <label className="block text-sm font-medium">Display name</label>
      <input className="mb-3 w-full rounded border p-2"
             value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
      <label className="block text-sm font-medium">Avatar (optional)</label>
      <input type="file" accept="image/*" className="mb-4 w-full"
             onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
      <button onClick={submit} className="rounded bg-black px-4 py-2 text-white">
        Save profile
      </button>
    </div>
  );
}
