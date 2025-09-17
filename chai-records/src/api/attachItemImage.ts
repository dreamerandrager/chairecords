import { supabase } from '@/utils/supabase/supabase';

export async function attachItemImage(opts: {
  itemId: string;
  imageUrl: string;
  sourceReviewId: string;
  sortOrder?: number;
  isPrimary?: boolean;
}) {
  const { itemId, imageUrl, sourceReviewId, sortOrder = 0, isPrimary = false } = opts;

  const { error } = await supabase.from('item_images').insert({
    item_id: itemId,
    url: imageUrl,
    sort_order: sortOrder,
    is_primary: isPrimary,
    source_review_id: sourceReviewId,
  });

  if (error) throw error;
}
