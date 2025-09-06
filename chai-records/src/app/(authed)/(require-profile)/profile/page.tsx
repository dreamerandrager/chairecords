'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useSession } from '@/providers/sessionProvider';

export default function ProfilePage() {
  const { profile } = useSession(); 

  if (!profile) return null; // layout handles redirect/loader

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{profile.display_name ?? 'Unnamed User'}'s Profile</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <Avatar className="size-20 rounded-full overflow-hidden">
            <AvatarImage src={profile.avatar_url ?? undefined} className="h-full w-full object-cover" />
            <AvatarFallback className="rounded-full uppercase">
              {profile.display_name?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>

          <div className="grid gap-1 text-center">
            <Label className="text-xs text-muted-foreground">Display name</Label>
            <div className="text-lg font-medium">{profile.display_name ?? 'New User'}</div>
          </div>
        </CardContent>

        <CardFooter className="grid place-items-center gap-1 text-center">
          <div><span className="font-medium">Admin:</span> {profile.admin ? 'Yes' : 'No'}</div>
          {profile.created_at && (
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(profile.created_at).toLocaleString()}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
