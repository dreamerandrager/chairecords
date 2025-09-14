'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ReviewsSection } from '../reviews/reviewsSection';

export type UserProfileCardProps = {
  id?: string | null;               // profile/user id
  displayName?: string | null;
  avatarUrl?: string | null;
  admin?: boolean | null;
  createdAt?: string | Date | null;
};

export function UserProfileCard({
  id,
  displayName,
  avatarUrl,
  admin,
  createdAt,
}: UserProfileCardProps) {
  const pathname = usePathname();
  const isOwnProfile = (pathname?.split('?')[0] ?? '') === '/profile';

  const name = (displayName ?? 'New User').trim();
  const initial = name.charAt(0).toUpperCase() || '?';

  const created =
    createdAt
      ? typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt
      : null;

  const titleText = isOwnProfile ? 'My Profile' : `${name}'s Profile`;
  const reviewsTitle = isOwnProfile ? 'My Reviews' : `${name}'s Reviews`;

  return (
    <>
      <Card className={cn('overflow-hidden')}>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <Avatar className="size-20 overflow-hidden rounded-full">
            <AvatarImage
              src={avatarUrl ?? undefined}
              className="h-full w-full object-cover"
              alt={`${name} avatar`}
            />
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
              <span className="font-medium">Created:</span> {created.toLocaleString()}
            </div>
          )}
        </CardFooter>
        
      </Card>

      {/* Reviews list for this user */}
      
    </>
  );
}
