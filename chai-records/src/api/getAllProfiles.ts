import { PageResult } from "@/types/pageResult";
import { Profile } from "@/types/profile";
import { supabase } from "@/utils/supabase/supabase";

export const DEFAULT_PAGE_SIZE = 10;

export async function getAllProfiles(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PageResult<Profile>> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at, admin", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}
