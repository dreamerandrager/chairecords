import { supabase } from "@/utils/supabase/supabase";


export async function createUnverifiedRestaurant(name: string, brandId?: string) {
  const { data, error } = await supabase.rpc('create_unverified_restaurant', {
    p_name: name,
    p_brand_id: brandId ?? null,   // if omitted, SQL defaults to 'Other'
  });
  if (error || !data) throw error ?? new Error('Failed to create restaurant');
  return String(data) as string;   // new restaurant id
}
