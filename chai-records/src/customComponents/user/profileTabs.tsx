'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReviewsSection } from '@/customComponents/reviews/reviewsSection';

type TabKey = 'reviews' | 'favorites';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'favorites', label: 'Favorites' },
];

export function ProfileTabs({ userId, displayName }: { userId: string; displayName: string }) {
  const [active, setActive] = useState<TabKey>('reviews');

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2" aria-label="Profile sections">
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
        <ReviewsSection userId={userId} title={`${displayName}'s Reviews`} className="p-0" />
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          Favorites and pins are coming soon. You&apos;ll be able to see what {displayName} is saving for later once this tab
          goes live.
        </Card>
      )}
    </div>
  );
}
