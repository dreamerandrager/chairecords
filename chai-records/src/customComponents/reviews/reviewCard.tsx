'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ReviewCardProps = {
  id: string;
  itemName: string;
  restaurantName: string;
  rating: number;                 // 1..5
  body?: string | null;
  photoUrl?: string | null;
  createdAt: string | Date;
  className?: string;
};

function Stars({ value }: { value: number }) {
  const full = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <div className="font-semibold tracking-tight" aria-label={`${full} out of 5`}>
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
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  return (
    <Card
  className={cn(
    'relative aspect-video overflow-hidden rounded-xl isolate',
    'bg-transparent border-0 ring-0 shadow-none outline-none',
    className
  )}
>
  {/* Background (single layer = overlay + image) */}
  <div className="absolute inset-0 z-0">
    <div className="absolute -inset-4">
      {photoUrl ? (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 h-full w-full',
            'bg-center bg-cover transform-gpu scale-110 blur-[2px]',
            '[--overlay:rgba(255,255,255,0.75)] dark:[--overlay:rgba(0,0,0,0.50)]',
            'pointer-events-none select-none'
          )}
          style={{
            backgroundImage: `linear-gradient(var(--overlay), var(--overlay)), url(${JSON.stringify(
              photoUrl
            )})`,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 to-white dark:from-slate-800 dark:to-slate-900" />
      )}
    </div>
  </div>




      {/* Content overlay */}
      <div className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] p-3 sm:p-4">
        {/* Top: title + restaurant */}
        <div>
          <div className="text-base font-semibold leading-tight line-clamp-1">{itemName}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{restaurantName}</div>
        </div>

        {/* Middle: rating + body */}
        <div className="mt-2 space-y-1">
          <Stars value={rating} />
          {body ? (
            <p className="text-sm text-muted-foreground line-clamp-3">{body}</p>
          ) : null}
        </div>

        {/* Bottom: date */}
        <div className="mt-2 flex items-end justify-end text-xs text-muted-foreground">
          {created ? <time dateTime={created.toISOString()}>{created.toLocaleDateString()}</time> : null}
        </div>
      </div>
    </Card>
  );
}
