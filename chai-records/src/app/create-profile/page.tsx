'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabase';

export default function CreateProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Make a local object URL to preview the selected file
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from('profiles').select('id').eq('id', session.user.id).maybeSingle();

      if (data) { router.replace('/profile'); return; }
      setLoading(false);
    })();
  }, [router]);

  async function handleCreate() {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    let avatar_url: string | null = null;
    if (file) {
      const path = `user/${userId}/${crypto.randomUUID()}-${file.name}`;
      const up = await supabase.storage.from('avatars').upload(path, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: '3600',
      });
      if (up.error) { setMessage(up.error.message); setSaving(false); return; }
      // Public bucket: get a public URL. If private, switch to createSignedUrl (see below).
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      avatar_url = data.publicUrl;
    }

    const { error } = await supabase.from('profiles').upsert(
      { id: userId, display_name: displayName || 'New User', avatar_url },
      { onConflict: 'id' }
    );
    if (error) { setMessage(error.message); setSaving(false); return; }

    router.replace('/profile');
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your profile</h1>
      {message && <div className="rounded border p-2 text-sm">{message}</div>}

      {/* Avatar preview in a circle */}
      <div className="flex items-center gap-4">
        <img
          src={previewUrl ?? 'https://via.placeholder.com/96?text=Avatar'}
          alt="avatar preview"
          className="h-24 w-24 rounded-full object-cover border"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Avatar (optional)</label>
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      <label className="block text-sm font-medium">Display name</label>
      <input
        className="w-full rounded border p-2"
        value={displayName}
        onChange={(e)=>setDisplayName(e.target.value)}
        placeholder="e.g., Kyle"
      />

      <button
        onClick={handleCreate}
        disabled={saving}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Create profile'}
      </button>
    </div>
  );
}
