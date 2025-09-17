import { supabase } from '@/utils/supabase/supabase';

export async function getFacetValuesByName(facetName: string) {
  // 1) facet id
  const { data: facet, error: fErr } = await supabase
    .from('facets')
    .select('id, name, allow_multiple')
    .eq('name', facetName)
    .single();
  if (fErr || !facet) throw fErr ?? new Error('Facet not found');

  // 2) values
  const { data: vals, error: vErr } = await supabase
    .from('facet_values')
    .select('id, value, slug')
    .eq('facet_id', facet.id)
    .order('value', { ascending: true });

  if (vErr) throw vErr;
  return { facetId: facet.id as number, allowMultiple: !!facet.allow_multiple, values: vals ?? [] };
}
