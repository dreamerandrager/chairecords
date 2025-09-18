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
          <Sparkles className="size-5" /> What&apos;s new in 1.2.0?
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Reviews feel richer than ever: drop photos, ratings, and tasting notes, then open the refreshed review
            modal to see every attribute you picked at a glance.
          </p>
          <p>
            Item cards now highlight pricing, facets, and who is raving about a dish, while restaurant profiles gather
            menus, attributes, and fresh directions with a Google Maps jump link.
          </p>
          <p>
            Pop into a friend&apos;s profile to see their latest picks and follow their trail across restaurants without
            losing your place.
          </p>
        </div>
      </section>

      {/* Current + Next */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h3 className="font-medium">What you can do today</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Log a review with photos, a 1–5 rating, tasting notes, and rich attributes.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Open an item card to see pricing, highlights, and who introduced it to the crew.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Explore restaurant profiles and tap the Google Maps link for a quick directions handoff.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              Browse a friend&apos;s public profile to see their latest finds at a glance.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="flex items-center gap-2 font-medium">
            <Clock className="size-4" /> What&apos;s next
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Insights: compare review history for similar dishes across restaurants.</li>
            <li>Collections: pin favourite dishes or restaurants to share with the squad.</li>
            <li>Friends: follow members and receive updates when new reviews drop.</li>
            <li>Messaging: coordinate meetups right from Chai Records.</li>
          </ul>
        </section>
      </div>

      {/* Vision */}
      <section className="mt-4 rounded-lg border p-4">
        <h3 className="flex items-center gap-2 font-medium">
          <Target className="size-4" /> The goal
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Provide an easy way for people to compare similar dishes at different restaurants, see what is recommended by
          other enthusiasts, and create a platform for sharing culinary experiences.
        </p>
      </section>
    </div>
  );
}
