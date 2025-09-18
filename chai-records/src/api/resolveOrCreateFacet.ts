// api/resolveOrCreateAttributeValue.ts
import { supabase } from '@/utils/supabase/supabase';

/** Creates (unverified) or reuses a facet value under Attribute (facet_id=4). Returns the facet_value id. */
export async function resolveOrCreateAttributeValue(value: string): Promise<number> {
  const { data, error } = await supabase.rpc('resolve_or_create_attribute_value', {
    p_value: value,
  });
  if (error || data == null) throw error ?? new Error('Attribute facet value resolve/create failed');
  return Number(data);
}

