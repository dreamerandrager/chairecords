'use client';

import { useSession } from '@/providers/sessionProvider';
import { CheckCircle2, Clock, Target, Sparkles } from 'lucide-react';

export default function Home() {
  const { profile } = useSession();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Welcome, {profile?.display_name ?? 'New User'}
        </h1>
      </div>
      {/* <p className="mb-6">{profile?.admin ? 'You are an admin.' : 'Regular user.'}</p> */}

      {/* App summary */}
      <section className="mb-6 rounded-lg border bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="size-5" /> What&apos;s new in 1.1.1?
        </h2>
        <p className="text-sm text-muted-foreground">
          Chai Records now gives every menu item and reviewer their own spotlight. Pop open a review and jump
          straight to a dedicated item page with photo, pricing, and community-loved facets, or visit a friend&apos;s
          profile to see who&apos;s behind the latest recommendations. It&apos;s the same simple way to capture great
          dishes, now with richer ways to explore them.
        </p>
      </section>

      {/* Current + Next */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h3 className="font-medium">What you can do today</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Create a review with a photo, a 1–5 rating, and notes.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Jump from any review to see the full item details and who shared it.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Browse a friend&apos;s public profile without leaving your own flow.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="flex items-center gap-2 font-medium">
            <Clock className="size-4" /> What&apos;s next
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Restaurant profile: richer menus, reviews across items, directions, and more.</li>
            <li>Item insights: deeper review history, galleries, and comparisons between restaurants.</li>
            <li>Friends: connect with friends to explore their profiles and reviews in one feed.</li>
            <li>Favourites/Pin: a shared list of go-to items and restaurants other members can follow.</li>
          </ul>
        </section>
      </div>

      {/* Vision */}
      <section className="mt-4 rounded-lg border p-4">
        <h3 className="flex items-center gap-2 font-medium">
          <Target className="size-4" /> The goal
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Provide an easy way for people to compare similar dishes at different restuarants, see what is recommended by other enthusiasts and create a platform for people to share their cullinary experiences!
        </p>
      </section>
    </div>
  );
}
