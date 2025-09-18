// api/getFacetsByReviewId.ts
import { supabase } from '@/utils/supabase/supabase';

export type ReviewFacets = {
  singleFacet: { name: string; value: string } | null;
  multiFacet: { name: string; values: string[] } | null;
};

export async function getFacetsByReviewId(reviewId: string): Promise<ReviewFacets> {
  const { data, error } = await supabase.rpc('get_review_facets', {
    p_review_id: reviewId,
  });
  if (error) throw error;

  // data is jsonb with keys { singleFacet, multiFacet }
  const d = (data as any) ?? {};
//   console.log('Facets for review', reviewId, d);
  return {
    singleFacet: d.singleFacet ?? null,
    multiFacet: d.multiFacet ?? null,
  };
}
