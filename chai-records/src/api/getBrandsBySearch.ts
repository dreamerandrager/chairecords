import { supabase } from '@/utils/supabase/supabase';

export async function getBrandsBySearch(q: string) {
  const query = supabase.from('brands').select('id,name,slug').order('name');
  return q?.trim().length >= 2
    ? (await query.ilike('name', `%${q}%`).limit(25)).data ?? []
    : (await query.limit(100)).data ?? [];
}
