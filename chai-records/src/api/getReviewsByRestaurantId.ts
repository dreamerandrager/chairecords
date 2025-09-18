// api/getReviewsByRestaurantId.ts
import type { Review } from "@/types/review";
import { supabase } from "@/utils/supabase/supabase";
import { getFacetsByReviewId } from "@/api/getFacetsByReviewId";

export async function getReviewsByRestaurantId(restaurantId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      created_at,
      rating_overall,
      body,
      profile_id,
      item:items!inner (
        id,
        name,
        restaurant_id,
        restaurant:restaurants ( id, name )
      ),
      review_images:item_images!item_images_source_review_id_fkey (
        url,
        is_primary
      )
    `)
    .eq("item.restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = (data ?? []).map((r: any) => ({
    id: r.id as string,
    createdAt: r.created_at as string,
    rating: r.rating_overall as number,
    body: (r.body ?? null) as string | null,
    itemId: r.item.id as string,
    itemName: r.item.name as string,
    restaurantId: r.item.restaurant_id as string,
    restaurantName: r.item.restaurant?.name as string,
    photoUrl: (r.review_images?.[0]?.url as string) ?? null,
    profileId: r.profile_id as string,
  }));

  const withFacets = await Promise.all(
    base.map(async (row) => {
      const fx = await getFacetsByReviewId(row.id);
      return { ...row, singleFacet: fx.singleFacet, multiFacet: fx.multiFacet };
    })
  );

  return withFacets as Review[];
}
