// src/app/create-profile/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import { RequireAuth, useSession } from '../../providers/sessionProvider';
import { Loader } from '../../customComponents/loader/loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function CreateProfilePage() {
  // User must be signed in, but we do NOT require an existing profile here
  return (
    <RequireAuth>
      <CreateProfileContent />
    </RequireAuth>
  );
}

function CreateProfileContent() {
  const router = useRouter();
  const { user, profile, profileReady, refreshProfile } = useSession();

  const [displayName, setDisplayName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewAvatar = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(
    () => () => {
      if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    },
    [previewAvatar]
  );

  // if a profile already exists, jump to /profile
  useEffect(() => {
    if (!profileReady) return;
    if (profile) router.replace("/profile");
  }, [profileReady, profile, router]);

  async function handleCreateProfile() {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    let avatar_url: string | null = null;
    if (file) {
      const path = `user/${user.id}/${crypto.randomUUID()}-${file.name}`;
      const upload = await supabase.storage.from("avatars").upload(path, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "3600",
      });
      if (upload.error) {
        setMessage(upload.error.message);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatar_url = data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, display_name: displayName || "New User", avatar_url },
        { onConflict: "id" }
      );
    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    router.replace("/profile");
  }

  if (!profileReady) return <Loader />;
  if (profile) return null; // the redirect effect will run

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your profile</h1>
      {message && <div className="rounded border p-2 text-sm">{message}</div>}

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage
            src={previewAvatar ?? "https://via.placeholder.com/96?text=Avatar"}
          />
          {/* <AvatarFallback>CN</AvatarFallback> */}
        </Avatar>
        <div>
          <Label>Avatar (optional)</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <Label>Display name</Label>
      <Input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="e.g., Kyle"
      />

      <Button onClick={handleCreateProfile} disabled={saving}>
        {saving ? "Saving…" : "Create profile"}
      </Button>
    </div>
  );
}
