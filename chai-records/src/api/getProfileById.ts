import { supabase } from "@/utils/supabase/supabase";
import type { ProfileDetails } from "@/types/profile";

export async function getProfileById(id: string): Promise<ProfileDetails | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, admin, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  const adminValue =
    typeof data.admin === "boolean" ? data.admin : data.admin === null ? null : Boolean(data.admin);

  return {
    id: data.id as string,
    display_name: (data.display_name ?? null) as string | null,
    avatar_url: (data.avatar_url ?? null) as string | null,
    admin: adminValue,
    created_at: (data.created_at ?? null) as string | null,
  } satisfies ProfileDetails;
}
