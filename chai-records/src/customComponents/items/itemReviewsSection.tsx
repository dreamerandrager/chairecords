// customComponents/reviews/itemReviewsSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader } from '@/customComponents/loader/loader';
import { Paginate } from '@/customComponents/paginate/paginate';
import { ReviewCard } from '@/customComponents/reviews/reviewCard';
import { getReviewsByItemId } from '@/api/getReviewsByItemId';
import type { Review } from '@/types/review';

type ItemReviewsSectionProps = {
  itemId: string;
  itemName: string;
  pageSize?: number;
};

export function ItemReviewsSection({
  itemId,
  itemName,
  pageSize = 12,
}: ItemReviewsSectionProps) {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const list = await getReviewsByItemId(itemId);
        if (alive) setRows(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [itemId]);

  const hasReviews = rows.length > 0;

  if (loading) {
    return (
      <div className="grid min-h-[30vh] place-items-center">
        <Loader variant="inline" message="Loading reviews…" />
      </div>
    );
  }

  if (!hasReviews) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No reviews have been posted for {itemName} yet.
      </Card>
    );
  }

  return (
    <Paginate items={rows} pageSize={pageSize} isLoading={loading}>
      {(pageItems) => (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((r) => (
            <ReviewCard
              key={r.id}
              id={r.id}
              itemId={r.itemId}
              profileId={r.profileId}
              itemName={r.itemName ?? itemName}
              restaurantName={r.restaurantName}
              restaurantId={r.restaurantId}
              rating={r.rating}
              body={r.body}
              photoUrl={r.photoUrl ?? undefined}
              createdAt={r.createdAt}
            />
          ))}
        </div>
      )}
    </Paginate>
  );
}
