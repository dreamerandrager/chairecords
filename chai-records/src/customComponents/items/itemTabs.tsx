'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ItemReviewsSection } from './itemReviewsSection';

type TabKey = 'reviews' | 'photos';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'photos', label: 'Gallery' },
];

export function ItemTabs({ itemId, itemName }: { itemId: string; itemName: string }) {
  const [active, setActive] = useState<TabKey>('reviews');

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2" aria-label="Item sections">
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
        <ItemReviewsSection itemId={itemId} itemName={itemName} />
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground" data-item-id={itemId}>
          A photo gallery for {itemName} is on the way. Add images to your reviews to help fill this space.
        </Card>
      )}
    </div>
  );
}
