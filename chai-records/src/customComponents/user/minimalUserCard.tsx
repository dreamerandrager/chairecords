'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function MinimalUserCard({
  displayName,
  avatarUrl,
}: {
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const name = displayName ?? 'New User';
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar className="size-10">
          <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="font-medium">{name}</div>
      </CardContent>
    </Card>
  );
}
