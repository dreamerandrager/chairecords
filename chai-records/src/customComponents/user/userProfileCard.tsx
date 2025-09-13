'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type UserProfileCardProps = {
  displayName?: string | null;
  avatarUrl?: string | null;
  admin?: boolean | null;
  createdAt?: string | Date | null;
};

export function UserProfileCard({
  displayName,
  avatarUrl,
  admin,
  createdAt,
}: UserProfileCardProps) {
  const name = (displayName ?? 'New User').trim();
  const initial = name.charAt(0).toUpperCase() || '?';

  const created =
    createdAt
      ? typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt
      : null;

  return (
    <Card className={cn('overflow-hidden')}>
      <CardHeader>
        <CardTitle>{`${name}'s Profile`}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        <Avatar className="size-20 rounded-full overflow-hidden">
          <AvatarImage src={avatarUrl ?? undefined} className="h-full w-full object-cover" alt={`${name} avatar`} />
          <AvatarFallback className="rounded-full uppercase">{initial}</AvatarFallback>
        </Avatar>

        <div className="grid gap-1 text-center">
          <Label className="text-xs text-muted-foreground">Display name</Label>
          <div className="text-lg font-medium">{name}</div>
        </div>
      </CardContent>

      <CardFooter className="grid place-items-center gap-1 text-center">
        {typeof admin !== 'undefined' && (
          <div>
            <span className="font-medium">Admin:</span> {admin ? 'Yes' : 'No'}
          </div>
        )}
        {created && (
          <div>
            <span className="font-medium">Created:</span>{' '}
            {created.toLocaleString()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
