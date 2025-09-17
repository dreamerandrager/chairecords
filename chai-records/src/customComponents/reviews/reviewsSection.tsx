'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ReviewCard } from '@/customComponents/reviews/reviewCard';
import { Paginate } from '@/customComponents/paginate/paginate';
import { Loader } from '@/customComponents/loader/loader';
import type { Review } from '@/types/review';
import { getReviewsByProfileId } from '@/api/getReviewsByProfileId';

type ReviewsSectionProps = {
  userId: string;        
  title?: string;           
  pageSize?: number;        
  className?: string;
};

export function ReviewsSection({
  userId,
  title = 'Reviews',
  pageSize = 12,
  className,
}: ReviewsSectionProps) {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const list = await getReviewsByProfileId(userId);
        if (alive) setRows(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <section className={cn('mx-auto w-full max-w-4xl p-4 md:p-6', className)}>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader variant="inline" message="Loading reviews…" />
        </div>
      ) : (
        <Paginate items={rows} pageSize={pageSize} isLoading={loading}>
          {(pageItems) => (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((r) => (
                <ReviewCard
                  key={r.id}
                  id={r.id}
                  profileId={r.profileId}
                  itemName={r.itemName}
                  restaurantName={r.restaurantName}
                  rating={r.rating}
                  body={r.body}
                  photoUrl={r.photoUrl ?? undefined}
                  createdAt={r.createdAt}
                />
              ))}
            </div>
          )}
        </Paginate>
      )}
    </section>
  );
}
