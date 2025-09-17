import { supabase } from '@/utils/supabase/supabase';

export async function getRestaurantsBySearch(opts: { brandId?: string; q?: string; includeUnverified?: boolean }) {
  const { brandId, q, includeUnverified } = opts;
  console.log(brandId)
  let query = supabase.from('restaurants')
    .select('id,name,brand_id,is_verified')
    .order('name');
  if (brandId) query = query.eq('brand_id', brandId);
  if (!includeUnverified) query = query.eq('is_verified', true);
  if (q && q.trim().length >= 2) query = query.ilike('name', `%${q}%`);
  return (await query.limit(50)).data ?? [];
}

