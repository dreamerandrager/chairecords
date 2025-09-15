'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/utils/supabase/supabase';
import { Textarea } from '@/components/ui/textarea';

const STORAGE_BUCKET = 'item-images';

type Brand = { id: string; name: string; slug: string };
type Restaurant = { id: string; name: string; brand_id: string | null };
type BrandItem = { name: string; category: 'FOOD' | 'BEVERAGE'; sample_item_id?: string };

export default function CreateReviewPage() {
  const router = useRouter();

  // ---------- state ----------
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>('');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');

  const [itemQuery, setItemQuery] = useState('');
  const [brandItemSuggestions, setBrandItemSuggestions] = useState<BrandItem[]>([]);
  const [chosenBrandItem, setChosenBrandItem] = useState<BrandItem | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingBrandItems, setLoadingBrandItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- load brands ----------
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug')
        .order('name', { ascending: true })
        .limit(200);
      if (!error && data) setBrands(data as Brand[]);
    })();
  }, []);

  // ---------- load restaurants for brand ----------
  useEffect(() => {
    if (!brandId) {
      setRestaurants([]);
      setRestaurantId('');
      return;
    }
    setLoadingRestaurants(true);
    (async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, brand_id')
        .eq('brand_id', brandId)
        .order('name', { ascending: true });
      if (!error && data) setRestaurants(data as Restaurant[]);
      setRestaurantId('');
      setLoadingRestaurants(false);
    })();
  }, [brandId]);

  // ---------- search brand items (suggestions) ----------
  useEffect(() => {
    if (!brandId) {
      setBrandItemSuggestions([]);
      return;
    }
    // Only hit the DB for 2+ chars
    if (!itemQuery || itemQuery.trim().length < 2) {
      setBrandItemSuggestions([]);
      return;
    }
    let isCancelled = false;
    setLoadingBrandItems(true);

    (async () => {
      // Prefer brand-dedup view if you created it; otherwise fall back to v_items_with_brand
      const { data, error } =
        await supabase
          .from('v_brand_items')               // columns: brand_id, brand_slug, name, slug, category, sample_item_id, updated_at
          .select('name, category, sample_item_id')
          .eq('brand_id', brandId)
          .ilike('name', `%${itemQuery}%`)
          .order('name', { ascending: true })
          .limit(20);

      if (!isCancelled) {
        if (!error && data) {
          setBrandItemSuggestions(
            data.map((d) => ({
              name: d.name,
              category: d.category,
              sample_item_id: d.sample_item_id,
            })) as BrandItem[],
          );
        }
        setLoadingBrandItems(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [brandId, itemQuery]);

  const canSubmit = useMemo(() => {
    if (!brandId || !restaurantId) return false;
    if (!chosenBrandItem && itemQuery.trim().length < 2) return false;
    if (!file && !uploadedUrl) return false;
    if (!rating || rating < 1 || rating > 5) return false;
    return !loading;
  }, [brandId, restaurantId, chosenBrandItem, itemQuery, file, uploadedUrl, rating, loading]);

  // ---------- helpers ----------
  async function uploadImageOrGetUrl(itemIdForPath: string) {
    if (uploadedUrl) return uploadedUrl;
    if (!file) throw new Error('Please choose an image.');

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `reviews/${itemIdForPath}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return pub.publicUrl;
  }

  /**
   * Resolve or create an item for the selected restaurant:
   * 1) exact ILIKE in the restaurant
   * 2) else copy category from best brand candidate (ILIKE on brand)
   * 3) else insert with fallback category = 'FOOD'
   */
  async function resolveOrCreateItemForRestaurant(): Promise<{ id: string }> {
  const desiredName = (chosenBrandItem?.name || itemQuery).trim();

  const { data, error } = await supabase.rpc('resolve_or_create_item', {
    p_brand_id: brandId,                          // uuid (brand selected)
    p_restaurant_id: restaurantId,                // uuid (restaurant selected)
    p_item_name: desiredName,                     // string
    p_category: (chosenBrandItem?.category ?? null) as
      | 'FOOD'
      | 'BEVERAGE'
      | null,                                     // optional hint; null lets SQL infer
  });

  if (error) throw error;
  if (!data) throw new Error('Item could not be resolved/created.');
  return { id: String(data) };                    // function returns the new/existing item uuid
}


  // ---------- submit ----------
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      // auth
      const { data: auth } = await supabase.auth.getUser();
      const profileId = auth.user?.id;
      if (!profileId) throw new Error('Not signed in.');

      // resolve/create item for this restaurant
      const { id: finalItemId } = await resolveOrCreateItemForRestaurant();

      // upload image first
      const imageUrl = await uploadImageOrGetUrl(finalItemId);

      // create review
      const { data: review, error: revErr } = await supabase
        .from('reviews')
        .insert({
          item_id: finalItemId,
          rating_overall: rating,
          body: body || null,
          profile_id: profileId,
        })
        .select('id')
        .single();
      if (revErr) throw revErr;

      // attach image to item with provenance
      const { error: imgErr } = await supabase.from('item_images').insert({
        item_id: finalItemId,
        url: imageUrl,
        sort_order: 0,
        is_primary: false,
        source_review_id: review!.id,
      });
      if (imgErr) throw imgErr;

      router.push(`/reviews/${profileId}`);
    } catch (err: unknown) {
      console.error(err);
      // setError(err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // ---------- UI ----------
  return (
    <div className="mx-auto w-full max-w-2xl p-4 space-y-6">
      {/* <h1 className="text-xl font-semibold">Create Review</h1> */}
      <p className="text-sm opacity-80">
        Start by choosing a <strong>Brand</strong>, then a <strong>Restaurant</strong>. Search the brand’s menu;
        if we can’t find your item, we’ll create it for that restaurant.
      </p>

      {error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <select
            id="brand"
            className="w-full rounded-md border p-2 dark:bg-gray-800"
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value);
              setRestaurantId('');
              setItemQuery('');
              setChosenBrandItem(null);
              setBrandItemSuggestions([]);
            }}
          >
            <option value="">Select a brand…</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Restaurant (filtered by brand) */}
        <div className="space-y-2">
          <Label htmlFor="restaurant">Restaurant</Label>
          <select
            id="restaurant"
            className="w-full rounded-md border p-2 dark:bg-gray-800"
            value={restaurantId}
            onChange={(e) => {
              setRestaurantId(e.target.value);
              setChosenBrandItem(null);
            }}
            disabled={!brandId || loadingRestaurants}
          >
            <option value="">
              {loadingRestaurants ? 'Loading…' : 'Select a restaurant…'}
            </option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Item search within brand */}
        <div className="space-y-2">
          <Label htmlFor="itemSearch">Item (brand-wide search)</Label>
          <Input
            id="itemSearch"
            placeholder="e.g. Zinger Burger"
            value={chosenBrandItem ? chosenBrandItem.name : itemQuery}
            onChange={(e) => {
              setChosenBrandItem(null);
              setItemQuery(e.target.value);
            }}
            disabled={!brandId}
          />
          {brandId && itemQuery.trim().length >= 2 && (
            <div className="rounded-md border p-2 text-sm dark:bg-gray-800">
              {loadingBrandItems && <div>Searching…</div>}
              {!loadingBrandItems && brandItemSuggestions.length === 0 && (
                <div>No brand matches. You can still create it.</div>
              )}
              {!loadingBrandItems &&
                brandItemSuggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={`${s.name}-${idx}`}
                    className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    onClick={() => {
                      setChosenBrandItem(s);
                      setItemQuery(s.name);
                    }}
                  >
                    {s.name} <span className="opacity-60">({s.category})</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label>Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Rating + Body */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="body">Review</Label>
          <Textarea
            id="body"
            placeholder="What did you think?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            spellCheck
          />
        </div>
        </div>

        <Button type="submit" disabled={!canSubmit}>
          {loading ? 'Submitting…' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
