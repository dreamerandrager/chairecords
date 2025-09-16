'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/utils/supabase/supabase';

import { SearchableSelect } from '@/customComponents/inputs/searchableSelect';
import { FacetPills } from '@/customComponents/attributes/facetPills';

// API helpers (renamed as you specified)
import { getBrandsBySearch } from '@/api/getBrandsBySearch';
import { getRestaurantsBySearch } from '@/api/getRestaurantsBySearch';
import { createUnverifiedRestaurant } from '@/api/createUnverifiedRestaurant';
import { getBrandItemsBySearch } from '@/api/getBrandItemsBySearch';
import { resolveOrCreateItemForRestaurant } from '@/api/resolveOrCreateItemForRestaurant';

const STORAGE_BUCKET = 'item-images';

type Brand = { id: string; name: string; slug: string };
type Restaurant = { id: string; name: string; brand_id: string | null; is_verified?: boolean };
type BrandItem = { name: string; category: 'FOOD' | 'BEVERAGE'; sample_item_id?: string };

type Option = { value: string; label: string; meta?: any };

export default function CreateReviewPage() {
  const router = useRouter();

  // ---------- selection state ----------
  const [brandId, setBrandId] = useState<string>('');
  const [brandOption, setBrandOption] = useState<Option | null>(null);

  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantOption, setRestaurantOption] = useState<Option | null>(null);

  // Item search
  const [itemQuery, setItemQuery] = useState('');
  const [brandItemSuggestions, setBrandItemSuggestions] = useState<BrandItem[]>([]);
  const [chosenBrandItem, setChosenBrandItem] = useState<BrandItem | null>(null);
  const [loadingBrandItems, setLoadingBrandItems] = useState(false);

  // Upload + review
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Item descriptors (category + facets)
  const [itemCategory, setItemCategory] = useState<'FOOD' | 'BEVERAGE'>('FOOD');
  const [singleFacetValue, setSingleFacetValue] = useState<string | null>(null); // Course or BeverageFamily
  const [multiFacetValues, setMultiFacetValues] = useState<string[]>([]);        // Attribute (<=3)

  // If the user picks a suggested brand item, carry its category through
  useEffect(() => {
    if (chosenBrandItem?.category) {
      setItemCategory(chosenBrandItem.category);
    }
  }, [chosenBrandItem]);

  // If category changes, clear facet selections (keeps logic simple)
  useEffect(() => {
    setSingleFacetValue(null);
    setMultiFacetValues([]);
  }, [itemCategory]);

  // ---------- brand-wide item search ----------
  useEffect(() => {
    const effectiveBrandId =
      brandId || (restaurantOption?.meta?.brand_id as string | undefined) || '';

    if (!effectiveBrandId || !itemQuery || itemQuery.trim().length < 2) {
      setBrandItemSuggestions([]);
      return;
    }

    let cancel = false;
    (async () => {
      setLoadingBrandItems(true);
      try {
        const rows = await getBrandItemsBySearch(effectiveBrandId, itemQuery);
        if (!cancel) setBrandItemSuggestions(rows as BrandItem[]);
      } finally {
        if (!cancel) setLoadingBrandItems(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [brandId, restaurantOption, itemQuery]);

  // ---------- guards ----------
  const canSubmit = useMemo(() => {
    const haveBrandOrRestaurant = Boolean(brandId || restaurantId);
    const haveRestaurant = Boolean(restaurantId);
    const haveItemText = chosenBrandItem || itemQuery.trim().length >= 2;
    const haveImage = Boolean(file || uploadedUrl);
    const ratingOk = rating >= 1 && rating <= 5;
    return !loading && haveBrandOrRestaurant && haveRestaurant && haveItemText && haveImage && ratingOk;
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

      // Derive effective brand id: prefer explicit brand selection,
      // else use the selected restaurant's brand_id, else 'Other'
      let effectiveBrandId = brandId;
      if (!effectiveBrandId && restaurantOption?.meta?.brand_id) {
        effectiveBrandId = restaurantOption.meta.brand_id as string;
      }

      // Resolve/create item with descriptors (RPC)
      const itemName = (chosenBrandItem?.name || itemQuery).trim();
      const finalItemId = await resolveOrCreateItemForRestaurant({
        brandId: effectiveBrandId,
        restaurantId,
        name: itemName,
        category: itemCategory,
        singleFacet: singleFacetValue
          ? {
              name: itemCategory === 'FOOD' ? 'Course' : 'BeverageFamily',
              value: singleFacetValue,
            }
          : null,
        multiFacet: {
          name: 'Attribute',
          values: multiFacetValues.slice(0, 3),
        },
      });

      // Upload image
      const imageUrl = await uploadImageOrGetUrl(finalItemId);

      // Create review
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

      // Attach image to item with provenance
      const { error: imgErr } = await supabase.from('item_images').insert({
        item_id: finalItemId,
        url: imageUrl,
        sort_order: 0,
        is_primary: false,
        source_review_id: review!.id,
      });
      if (imgErr) throw imgErr;

      router.push(`/reviews/${profileId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // ---------- UI ----------
  return (
    <div className="mx-auto w-full max-w-2xl p-4 space-y-6">
      <p className="text-sm opacity-80">
        Pick a <strong>Brand</strong> or directly search a <strong>Restaurant</strong>. Search the brand’s menu;
        if it’s not there, we’ll create the item for that restaurant with your descriptors.
      </p>

      {error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Brand (searchable) */}
        <div className="space-y-2">
          <Label>Brand</Label>
          <SearchableSelect
            value={brandId || null}
            onChange={(opt: Option) => {
              setBrandOption(opt);
              setBrandId(opt?.value || '');
              // Reset dependent selections
              setRestaurantOption(null);
              setRestaurantId('');
              setChosenBrandItem(null);
              setItemQuery('');
              setBrandItemSuggestions([]);
            }}
            loadOptions={async (q: string) => {
              const rows: Brand[] = await getBrandsBySearch(q);
              return rows.map((b) => ({ value: b.id, label: b.name, meta: b }));
            }}
            placeholder="Search brand…"
          />
        </div>

        {/* Restaurant (searchable; filtered by brand if selected; verified only) */}
        <div className="space-y-1">
          <Label>Restaurant</Label>
          <SearchableSelect
            value={restaurantId || null}
            onChange={(opt: Option) => {
              setRestaurantOption(opt);
              setRestaurantId(opt?.value || '');
              setChosenBrandItem(null);
            }}
            loadOptions={async (q: string) => {
              const rows: Restaurant[] = await getRestaurantsBySearch({
                brandId: brandId || undefined,
                q,
                includeUnverified: false,
              });
              return rows.map((r) => ({
                value: r.id,
                label: r.name,
                meta: r,
              }));
            }}
            placeholder={brandId ? 'Search this brand’s restaurants…' : 'Search restaurants…'}
          />

          {/* Add new restaurant inline */}
          <div className="text-xs opacity-80">
            Can’t find your restaurant?{' '}
            <button
              type="button"
              className="underline"
              onClick={async () => {
                const name = prompt('Restaurant name');
                if (!name) return;
                try {
                  const newId = await createUnverifiedRestaurant(name, brandId || undefined);
                  // select it immediately
                  setRestaurantId(newId);
                  setRestaurantOption({ value: newId, label: name, meta: { is_verified: false, brand_id: brandId || null } });
                  // if brand not chosen, optionally set to Other (try to fetch it quickly)
                  if (!brandId) {
                    try {
                      const others = (await getBrandsBySearch('other')) as any[];
                      const other = others.find((b) => (b.slug || '').toLowerCase() === 'other');
                      if (other) {
                        setBrandId(other.id);
                        setBrandOption({ value: other.id, label: other.name, meta: other });
                      }
                    } catch {}
                  }
                  alert('Added! It will appear publicly once verified.');
                } catch (e: any) {
                  alert(e?.message ?? 'Failed to add restaurant');
                }
              }}
            >
              Add it into our system
            </button>
          </div>

          {/* If selected restaurant is unverified, show a hint */}
          {restaurantOption?.meta?.is_verified === false && (
            <div className="text-xs text-amber-600">Pending verification — visible to you now, public later.</div>
          )}
        </div>

        {/* Item search within brand */}
        <div className="space-y-2">
          <Label htmlFor="itemSearch">Item (brand-wide search)</Label>
          <Input
            id="itemSearch"
            placeholder="e.g. Cappuccino"
            value={chosenBrandItem ? chosenBrandItem.name : itemQuery}
            onChange={(e) => {
              setChosenBrandItem(null);
              setItemQuery(e.target.value);
            }}
            disabled={!(brandId || restaurantOption?.meta?.brand_id)}
          />
          {(brandId || restaurantOption?.meta?.brand_id) && itemQuery.trim().length >= 2 && (
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

        {/* Category toggle */}
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex gap-2">
            {(['FOOD', 'BEVERAGE'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`px-3 py-1 rounded border text-sm ${
                  itemCategory === cat ? 'bg-primary text-white border-primary' : ''
                }`}
                onClick={() => setItemCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Single facet (Course or BeverageFamily) */}
        <div className="space-y-2">
          <Label>{itemCategory === 'FOOD' ? 'Course' : 'Beverage Family'} (pick one)</Label>
          <FacetPills
            facetName={itemCategory === 'FOOD' ? 'Course' : 'BeverageFamily'}
            mode="single"
            valueSingle={singleFacetValue}
            onChangeSingle={setSingleFacetValue}
          />
        </div>

        {/* Multi facet (Attributes, max 3) */}
        <div className="space-y-2">
          <Label>Attributes (up to 3)</Label>
          <FacetPills
            facetName="Attribute"
            mode="multi"
            maxMulti={3}
            valueMulti={multiFacetValues}
            onChangeMulti={setMultiFacetValues}
          />
        </div>

        {/* Image upload */}
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
