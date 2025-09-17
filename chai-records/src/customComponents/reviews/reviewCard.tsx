'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReviewModal } from './reviewModal';

export type ReviewCardProps = {
  id: string;
  profileId: string;            // ✅ required now
  itemName: string;
  restaurantName: string;
  restaurantId: string;  
  rating: number;               // 1..5
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
  id,
  profileId,
  itemName,
  restaurantName,
  restaurantId,
  rating,
  body,
  photoUrl,
  createdAt,
  className,
}: ReviewCardProps) {
  const [open, setOpen] = useState(false);
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
        className={cn(
          'relative aspect-video overflow-hidden rounded-xl isolate',
          'bg-transparent border-0 ring-0 shadow-none outline-none',
          'cursor-pointer transition-transform duration-200 hover:scale-[1.02]',
          className
        )}
      >
        {/* Background */}
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
          {/* Top */}
          <div>
            <div className="text-base font-semibold leading-tight line-clamp-1">{itemName}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">{restaurantName}</div>
          </div>

          {/* Middle */}
          <div className="mt-2 space-y-1">
            <Stars value={rating} />
            {/* Body preview removed as requested */}
          </div>

          {/* Bottom */}
          <div className="mt-2 flex items-end justify-end text-xs text-muted-foreground">
            {created ? <time dateTime={created.toISOString()}>{created.toLocaleDateString()}</time> : null}
          </div>
        </div>
      </Card>

      {open && (
        <ReviewModal
          onClose={() => setOpen(false)}
          id={id}
          profileId={profileId}
          itemName={itemName}
          restaurantName={restaurantName}
          restaurantId={restaurantId} 
          rating={rating}
          body={body ?? null}
          photoUrl={photoUrl ?? null}
          createdAt={created}
        />
      )}
    </>
  );
}
