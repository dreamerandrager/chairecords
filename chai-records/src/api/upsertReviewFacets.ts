import { supabase } from '@/utils/supabase/supabase';

type SingleFacet = { name: string; value: string } | null;
type MultiFacet  = { name: string; values: string[] } | null;

export async function upsertReviewFacets(opts: {
  reviewId: string;
  singleFacet?: SingleFacet;
  multiFacet?: MultiFacet;
}) {
  const { reviewId, singleFacet = null, multiFacet = null } = opts;

  // Nothing to do?
  if (!singleFacet && (!multiFacet || (multiFacet.values ?? []).length === 0)) return;

  // 1) Resolve facet ids by name (dedup)
  const facetNames = [
    ...(singleFacet?.name ? [singleFacet.name] : []),
    ...(multiFacet?.name ? [multiFacet.name] : []),
  ];
  const uniqueFacetNames = Array.from(new Set(facetNames.map((n) => n.trim())));

  let facets: { id: number; name: string }[] = [];
  if (uniqueFacetNames.length) {
    const { data, error } = await supabase
      .from('facets')
      .select('id,name')
      .in('name', uniqueFacetNames);
    if (error) throw error;
    facets = data ?? [];
  }

  const facetIdByName = new Map(facets.map((f) => [f.name, f.id]));

  // 2) SINGLE facet upsert
  if (singleFacet) {
    const facetId = facetIdByName.get(singleFacet.name);
    if (facetId) {
      // Resolve value id for this facet
      const { data: singleVal, error: valErr } = await supabase
        .from('facet_values')
        .select('id, value')
        .eq('facet_id', facetId)
        .eq('value', singleFacet.value)
        .maybeSingle();
      if (valErr) throw valErr;

      if (singleVal?.id) {
        const { error } = await supabase
          .from('review_facet_single')
          .upsert(
            {
              review_id: reviewId,
              facet_id: facetId,
              facet_value_id: singleVal.id,
            },
            { onConflict: 'review_id,facet_id' },
          );
        if (error) throw error;
      }
    }
  }

  // 3) MULTI facet upsert (cap to 3 values client-side if you want)
  if (multiFacet && (multiFacet.values?.length ?? 0) > 0) {
    const facetId = facetIdByName.get(multiFacet.name);
    if (facetId) {
      // Resolve all value ids for this facet
      const valuesWanted = Array.from(
        new Set(multiFacet.values.map((v) => v.trim()).filter(Boolean)),
      );
      if (valuesWanted.length) {
        const { data: vals, error: valsErr } = await supabase
          .from('facet_values')
          .select('id, value')
          .eq('facet_id', facetId)
          .in('value', valuesWanted);
        if (valsErr) throw valsErr;

        const rows =
          (vals ?? []).map((v) => ({
            review_id: reviewId,
            facet_id: facetId,
            facet_value_id: v.id,
          })) ?? [];

        if (rows.length) {
          const { error } = await supabase
            .from('review_facet_multi')
            .upsert(rows, { onConflict: 'review_id,facet_id,facet_value_id', ignoreDuplicates: true });
          if (error) throw error;
        }
      }
    }
  }
}
