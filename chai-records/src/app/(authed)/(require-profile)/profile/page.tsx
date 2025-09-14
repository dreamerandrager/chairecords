'use client';

import { useSession } from '@/providers/sessionProvider';
import { UserProfileCard } from '@/customComponents/user/userProfileCard';

export default function ProfilePage() {
  const { profile } = useSession();

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <UserProfileCard
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        admin={profile.admin ? true : false}
        createdAt={profile.created_at}
      />
    </div>
  );
}
