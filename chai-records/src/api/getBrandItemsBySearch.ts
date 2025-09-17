import { supabase } from '@/utils/supabase/supabase';

export async function getBrandItemsBySearch(brandId: string, q: string) {
  const like = `%${q}%`;
  // try deduped brand view first
  const { data, error } = await supabase
    .from('v_brand_items')
    .select('name,category,sample_item_id')
    .eq('brand_id', brandId)
    .ilike('name', like)
    .order('name')
    .limit(25);
  if (error) console.warn('v_brand_items error', error);

  if (data && data.length) return data;

  // fallback to raw items with brand join
  const raw = await supabase
    .from('v_items_with_brand')
    .select('name,category')
    .eq('brand_id', brandId)
    .ilike('name', like)
    .order('name')
    .limit(50);
  const seen = new Set<string>();
  return (raw.data ?? []).filter(r => {
    const k = r.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}