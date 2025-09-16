'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RestaurantReviewsSection } from '@/customComponents/restaurants/restaurantReviewsSection';

type TabKey = 'reviews' | 'items';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'items', label: 'Items' },
];

type RestaurantTabsProps = {
  restaurantId: string;
  restaurantName: string;
};

export function RestaurantTabs({ restaurantId, restaurantName }: RestaurantTabsProps) {
  const [active, setActive] = useState<TabKey>('reviews');

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2" aria-label="Restaurant sections">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={active === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActive(tab.id)}
            aria-pressed={active === tab.id}
          >
            {tab.label}
          </Button>
        ))}
      </nav>

      {active === 'reviews' ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          <RestaurantReviewsSection restaurantId={restaurantId} restaurantName={restaurantName} />
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          Menu items for {restaurantName} will appear here once they&apos;re ready.
        </Card>
      )}
    </div>
  );
}
