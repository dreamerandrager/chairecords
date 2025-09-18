'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader } from '@/customComponents/loader/loader';
import { Paginate } from '@/customComponents/paginate/paginate';
import { ReviewCard } from '@/customComponents/reviews/reviewCard';
import { getReviewsByRestaurantId } from '@/api/getReviewsByRestaurantId';
import type { Review } from '@/types/review';

type RestaurantReviewsSectionProps = {
  restaurantId: string;
  restaurantName: string;
  pageSize?: number;
};

export function RestaurantReviewsSection({
  restaurantId,
  restaurantName,
  pageSize = 12,
}: RestaurantReviewsSectionProps) {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const list = await getReviewsByRestaurantId(restaurantId);
        console.log("list",list)
        if (alive) setRows(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [restaurantId]);

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
        No reviews have been posted for {restaurantName} yet.
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
              itemId={r.itemId} // Added to enable ReviewModal item navigation from restaurant context.
              profileId={r.profileId}
              id={r.id}
              itemName={r.itemName}
              restaurantName={r.restaurantName ?? restaurantName}
              restaurantId={r.restaurantId ?? restaurantId}
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
