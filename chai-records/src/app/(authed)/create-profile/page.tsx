'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import { useSession } from '@/providers/sessionProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, profile, profileReady, refreshProfile } = useSession();

  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewAvatar = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(() => () => { if (previewAvatar) URL.revokeObjectURL(previewAvatar); }, [previewAvatar]);

  useEffect(() => {
    if (!profileReady) return;      
    if (profile) router.replace('/profile');
  }, [profileReady, profile, router]);

  async function handleCreateProfile() {
    if (!user) return; 
    setSaving(true);
    setMessage(null);

    let avatar_url: string | null = null;
    if (file) {
      const path = `user/${user.id}/${crypto.randomUUID()}-${file.name}`;
      const up = await supabase.storage.from('avatars').upload(path, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: '3600',
      });
      if (up.error) { setMessage(up.error.message); setSaving(false); return; }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      avatar_url = data.publicUrl;
    }

    const { error } = await supabase.from('profiles').upsert(
      { id: user.id, display_name: displayName || 'New User', avatar_url },
      { onConflict: 'id' }
    );
    if (error) { setMessage(error.message); setSaving(false); return; }

    await refreshProfile();
    router.replace('/profile');    
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      {message && <div className="rounded border p-2 text-sm">{message}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
          <CardDescription>Choose a display name and avatar that others will see.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <div className="flex items-center justify-center">
            <Avatar className="size-20 rounded-full overflow-hidden">
              <AvatarImage src={previewAvatar ?? undefined} className="h-full w-full object-cover" />
              <AvatarFallback className="rounded-full">?</AvatarFallback>
            </Avatar>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="avatar">Avatar (optional)</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g., Kyle" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <Button onClick={handleCreateProfile} disabled={saving}>
            {saving ? 'Saving…' : 'Create profile'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
