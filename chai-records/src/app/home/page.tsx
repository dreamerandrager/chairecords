"use client";

import { RequireAuth, useSession } from "../../providers/sessionProvider";

export default function Home() {
  return (
    <RequireAuth requireProfile>
      <HomeContent />
    </RequireAuth>
  );
}

function HomeContent() {
  const { profile } = useSession();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Welcome, {profile?.display_name ?? "New User"}
        </h1>
      </div>
      <p>{profile?.admin ? "You are an admin." : "Regular user."}</p>
    </div>
  );
}
