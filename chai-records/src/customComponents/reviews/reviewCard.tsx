'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ReviewCardProps = {
  id: string;
  itemName: string;
  restaurantName: string;
  rating: number;                  // 1..5
  body?: string | null;
  photoUrl?: string | null;
  createdAt: string | Date;
  className?: string;
};

function Stars({ value }: { value: number }) {
  // simple visual star row without extra deps
  const full = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <div className="font-medium" aria-label={`${full} out of 5`}>
      {'★'.repeat(full)}
      <span className="text-muted-foreground">{'★'.repeat(5 - full)}</span>
    </div>
  );
}

export function ReviewCard({
  itemName,
  restaurantName,
  rating,
  body,
  photoUrl,
  createdAt,
  className,
}: ReviewCardProps) {
  const created =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-tight">
          {itemName}
        </CardTitle>
        <div className="text-xs text-muted-foreground">{restaurantName}</div>
      </CardHeader>

      {photoUrl && (
  <div className="mx-auto h-40 w-full sm:size-48 rounded-md overflow-hidden bg-muted">
    <img
      src={photoUrl}
      alt={`${itemName} photo`}
      className="h-full w-full object-contain"
      loading="lazy"
    />
  </div>
)}

      <CardContent className="space-y-2 pt-3">
        <Stars value={rating} />
        {body ? (
          <p className="text-sm text-muted-foreground line-clamp-3">{body}</p>
        ) : null}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        {created ? created.toLocaleDateString() : null}
      </CardFooter>
    </Card>
  );
}
