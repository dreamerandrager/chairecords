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
          <Sparkles className="size-5" /> What is &apos;Chai Records&apos;?
        </h2>
        <p className="text-sm text-muted-foreground">
          A simple place to review and eventually explore drinks & dishes across restaurants. Capture a photo,
          rating, and notes that will affect an item&apos;s rating and what other users see about it to guide them in who has the most loved menu and what they offer.
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
              See your profile and browse other users&apos; profiles.
            </li>
             <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4" />
              View users&apos; reviews from the Find Friends page.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="flex items-center gap-2 font-medium">
            <Clock className="size-4" /> What&apos;s next
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Restaurant profile: view items, reviews across items, get directions.</li>
            <li>View items: details, photos, reviews, recommended restaurants.</li>
            <li>Friends: connect with friends to explore their profiles and reviews.</li>
            <li>Favourites/Pin: a tab for favourited items and restaurants that others can see.</li>
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
