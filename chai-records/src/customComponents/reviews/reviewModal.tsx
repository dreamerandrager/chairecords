'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase/supabase';
import { cn } from '@/lib/utils';
import { Utensils, Building2, User as UserIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Profile = { display_name: string; avatar_url: string | null };

type Props = {
  onClose: () => void;
  id: string;
  itemId: string;
  profileId: string;
  itemName: string;
  restaurantName: string;
  restaurantId: string;
  rating: number;
  body: string | null;
  photoUrl: string | null;
  createdAt: Date;
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

export function ReviewModal(props: Props) {
  const { onClose, itemId, profileId, itemName, restaurantName, restaurantId, rating, body, photoUrl, createdAt } = props;
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', profileId)
        .maybeSingle();
      if (!cancel) setProfile((data as Profile) ?? { display_name: 'User', avatar_url: null });
    })();
    return () => { cancel = true; };
  }, [profileId]);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const handleGoToItem = () => {
    if (!itemId) return;
    router.push(`/items/${itemId}`);
    onClose();
  };

  const handleGoToRestaurant = () => {
    if (!restaurantId) return;
    router.push(`/restaurants/${restaurantId}`);
    onClose();
  };

  const handleGoToReviewer = () => {
    if (!profileId) return;
    router.push(`/viewprofile/${profileId}`);
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100]',
        'bg-black/55 backdrop-blur-md',
        'flex items-center justify-center p-3 sm:p-6'
      )}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg">
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 rounded-full bg-background/90 shadow p-1 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Entire card scrolls (image included) */}
        <Card className="overflow-hidden rounded-2xl shadow-xl max-h-[85vh] sm:max-h-[80vh]">
          <div className="max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            {/* Media — reduced height; part of scrollable area */}
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${itemName} photo`}
                className="w-full max-h-[32vh] sm:max-h-[28vh] object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full max-h-[24vh] h-24 bg-gradient-to-br from-slate-200 to-white dark:from-slate-800 dark:to-slate-900" />
            )}

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Header: item + restaurant */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold leading-tight">{itemName}</h2>
                  <div className="text-xs text-muted-foreground">{restaurantName}</div>
                </div>
                <div className="text-right shrink-0">
                  <Stars value={rating} />
                  <time
                    className="block text-xs text-muted-foreground mt-1"
                    dateTime={createdAt.toISOString()}
                  >
                    {createdAt.toLocaleString()}
                  </time>
                </div>
              </div>

              {/* Reviewer */}
              <div className="flex items-center gap-3">
                <img
                  src={
                    profile?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      profile?.display_name ?? 'User'
                    )}`
                  }
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-black/5"
                />
                <div className="text-sm">
                  <div className="font-medium leading-tight">{profile?.display_name ?? 'User'}</div>
                  <div className="text-xs text-muted-foreground leading-tight">Reviewer</div>
                </div>
              </div>

              {/* Body (long text scrolls with everything else) */}
              {body ? (
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {body}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No written review.</p>
              )}

              {/* CTAs */}
        
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-1"
                  aria-label="Go to item"
                  title="Go to item"
                  onClick={handleGoToItem}
                  disabled={!itemId}
                >
                  <Utensils className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Go to item</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-1"
                  aria-label="Go to restaurant"
                  title="Go to restaurant"
                  onClick={handleGoToRestaurant}
                  disabled={!restaurantId}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Go to restaurant</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-1"
                  aria-label="Go to reviewer"
                  title="Go to reviewer"
                  onClick={handleGoToReviewer}
                  disabled={!profileId}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Go to reviewer</span>
                </Button>
              </div>

              </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
