import { notFound } from "next/navigation";
import { getProfileById } from "@/api/getProfileById";
import { UserProfileCard } from "@/customComponents/user/userProfileCard";
import { ProfileTabs } from "@/customComponents/user/profileTabs";

export default async function ViewProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  const displayName = (profile.display_name ?? 'New User').trim() || 'New User';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <UserProfileCard
        id={profile.id}
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        admin={profile.admin ?? false}
        createdAt={profile.created_at}
      />
      <ProfileTabs userId={profile.id} displayName={displayName} />
    </div>
  );
}
