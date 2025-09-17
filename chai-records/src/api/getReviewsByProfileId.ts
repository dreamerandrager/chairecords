// api/getReviewsByProfileId.ts
import { Review } from "@/types/review";
import { supabase } from "@/utils/supabase/supabase";

export async function getReviewsByProfileId(profileId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      created_at,
      profile_id,
      rating_overall,
      body,
      item:items (
        id,
        name,
        restaurant:restaurants (
          id,
          name
        )
      ),
      review_images:item_images!item_images_source_review_id_fkey (
        url,
        is_primary
      )
    `)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: r.id as string,
    profileId: r.profile_id as string,
    createdAt: r.created_at as string,
    rating: r.rating_overall as number,
    body: (r.body ?? null) as string | null,
    itemId: r.item.id as string,
    itemName: r.item.name as string,
    restaurantId: r.item.restaurant.id as string,
    restaurantName: r.item.restaurant.name as string,
    photoUrl: (r.review_images?.[0]?.url as string) ?? null,
  }));
}
