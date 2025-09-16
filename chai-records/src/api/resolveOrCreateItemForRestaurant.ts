import { supabase } from '@/utils/supabase/supabase';

export async function resolveOrCreateItemForRestaurant(opts: {
  brandId: string;
  restaurantId: string;
  name: string;
  category?: 'FOOD' | 'BEVERAGE' | null;
  singleFacet?: { name: string; value: string } | null;  // e.g. { name: 'Course', value:'MAIN' }
  multiFacet?: { name: string; values: string[] } | null; // e.g. { name:'Attribute', values:['HOT','VEGETARIAN'] }
}) {
  const { brandId, restaurantId, name, category, singleFacet, multiFacet } = opts;

  const { data, error } = await supabase.rpc('resolve_or_create_item', {
    p_brand_id: brandId,
    p_restaurant_id: restaurantId,
    p_item_name: name,
    p_category: category ?? null,
    p_single_facet_name: singleFacet?.name ?? null,
    p_single_facet_value: singleFacet?.value ?? null,
    p_multi_facet_name: multiFacet?.name ?? 'Attribute',
    p_multi_values: (multiFacet?.values ?? []) as any,
  });

  if (error || !data) throw error ?? new Error('Item resolve/create failed');
  return String(data) as string; // item id
}
