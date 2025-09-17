import { supabase } from '@/utils/supabase/supabase';

export async function createReview(opts: {
  itemId: string;
  rating: number;
  body?: string | null;
  profileId: string;
}) {
  const { itemId, rating, body, profileId } = opts;

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      item_id: itemId,
      rating_overall: rating,
      body: body || null,
      profile_id: profileId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data!.id as string; // reviewId
}
