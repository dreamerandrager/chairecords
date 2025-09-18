// api/getReviewsByItemId.ts
import type { Review } from "@/types/review";
import { supabase } from "@/utils/supabase/supabase";
import { getFacetsByReviewId } from "@/api/getFacetsByReviewId";

export async function getReviewsByItemId(itemId: string): Promise<Review[]> {
  const { data, error } = await supabase.rpc("get_reviews_by_item_id", {
    p_item_id: itemId,
  });
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = (data ?? []).map((r: any) => ({
    id: r.id as string,
    createdAt: r.created_at as string,
    rating: r.rating_overall as number,
    body: (r.body ?? null) as string | null,
    itemId: r.item_id as string,
    itemName: r.item_name as string,
    restaurantId: r.restaurant_id as string,
    restaurantName: r.restaurant_name as string,
    photoUrl: (r.photo_url as string) ?? null,
    profileId: r.profile_id as string,
  }));

  const withFacets = await Promise.all(
    base.map(async (row: any) => {
      const fx = await getFacetsByReviewId(row.id);
      return { ...row, singleFacet: fx.singleFacet, multiFacet: fx.multiFacet };
    })
  );

  return withFacets as Review[];
}
