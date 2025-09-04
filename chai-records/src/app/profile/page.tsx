'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Label } from '@radix-ui/react-label';
import { Profile } from '@/types/profile';
import { ChaiLoader } from '@/customComponents/loader/loader';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, admin, created_at")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) setMessage(error.message);

      if (!data) {
        router.replace("/create-profile");
        return;
      }

      setProfile(data);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <ChaiLoader className="text-foreground/80"/>;

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      {message && <div className="rounded border p-2 text-sm">{message}</div>}
      <Card>
        <CardHeader>
          <CardTitle>{profile?.display_name ?? "Unnamed User"}'s Profile</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <Avatar className="size-20 rounded-full overflow-hidden">
            <AvatarImage
              src={profile?.avatar_url ?? undefined}
              className="h-full w-full object-cover"
            />
            <AvatarFallback className="rounded-full uppercase">
              {profile?.display_name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="grid gap-1 text-center">
            <Label className="text-xs text-muted-foreground">
              Display name
            </Label>
            <div className="text-lg font-medium">
              {profile?.display_name ?? "New User"}
            </div>
          </div>
        </CardContent>

        <CardFooter className="grid place-items-center gap-1 text-center">
          <div>
            <span className="font-medium">Admin:</span>{" "}
            {profile?.admin ? "Yes" : "No"}
          </div>
          {profile?.created_at && (
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(profile.created_at).toLocaleString()}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
