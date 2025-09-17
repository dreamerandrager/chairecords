// api/resolveOrCreateItemForRestaurant.ts
import { supabase } from '@/utils/supabase/supabase';

export async function resolveOrCreateItemForRestaurant(opts: {
  brandId: string;
  restaurantId: string;
  name: string;
  category?: 'FOOD' | 'BEVERAGE' | null;
}) {
  const { brandId, restaurantId, name, category } = opts;

  const { data, error } = await supabase.rpc('resolve_or_create_item', {
    p_brand_id: brandId,
    p_restaurant_id: restaurantId,
    p_item_name: name,
    p_category: category ?? null,
  });

  if (error || !data) throw error ?? new Error('Item resolve/create failed');
  return String(data) as string; // item id
}
