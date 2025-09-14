'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserProfileCard } from '@/customComponents/user/userProfileCard';

type MinimalUserCardProps = {
  id: string | null | undefined;
  displayName: string | null | undefined;
  avatarUrl: string | null | undefined;
  admin: boolean | null;
  createdAt: string | Date | null | undefined;
};

export function MinimalUserCard({
  id,
  displayName,
  avatarUrl,
}: MinimalUserCardProps) {
  const router = useRouter();

  const name = (displayName ?? 'New User').trim();
  const initial = name.charAt(0).toUpperCase() || '?';

  const goToReviews = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open modal
    if (id) router.push(`/reviews/${id}`);
  };

  return (
    <>
      {/* Clickable mini card */}
      <Card
        className="cursor-pointer overflow-hidden transition hover:shadow-md"
      >
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={avatarUrl ?? undefined} className="object-cover" alt={`${name} avatar`} />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{name}</div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={goToReviews}
            disabled={!id}
          >
            View reviews
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
