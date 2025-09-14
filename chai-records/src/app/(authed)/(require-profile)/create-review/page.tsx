// app/create-review/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from "@/utils/supabase/supabase";

// --- adjust bucket name if you use a different one ---
const STORAGE_BUCKET = 'item-images'; // create a public bucket named "item-images"

type Restaurant = { id: string; name: string };
type Item = { id: string; name: string; restaurant_id: string };

export default function CreateReviewPage() {
  const router = useRouter();

  // form state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');

  const [useExistingItem, setUseExistingItem] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(''); // must match your USER-DEFINED type value

  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load restaurants (simple: first 100)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .order('name', { ascending: true })
        .limit(100);
      if (!error && data) setRestaurants(data as Restaurant[]);
    })();
  }, []);

  // load items when restaurant changes (existing-item mode)
  useEffect(() => {
    if (!restaurantId || !useExistingItem) return;
    setLoadingItems(true);
    (async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, restaurant_id')
        .eq('restaurant_id', restaurantId)
        .order('name', { ascending: true })
        .limit(200);
      if (!error && data) setItems(data as Item[]);
      setLoadingItems(false);
    })();
  }, [restaurantId, useExistingItem]);

  // simple guard
  const canSubmit = useMemo(() => {
    if (!restaurantId) return false;
    if (useExistingItem && !itemId) return false;
    if (!useExistingItem && !newItemName) return false;
    if (!file && !uploadedUrl) return false; // must have either an uploaded file or a pasted URL
    if (!rating || rating < 1 || rating > 5) return false;
    return !loading;
  }, [restaurantId, useExistingItem, itemId, newItemName, file, uploadedUrl, rating, loading]);

  // Upload file to Supabase Storage (returns public URL)
  async function uploadImageOrGetUrl(itemIdForPath: string) {
    // If user already pasted a URL (advanced), just use it
    if (uploadedUrl) return uploadedUrl;
    if (!file) throw new Error('Please choose an image.');

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `reviews/${itemIdForPath}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
               console.log("here we failed upload image")
        throw upErr
    };

    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return pub.publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      // get current user/profile
      const { data: auth } = await supabase.auth.getUser();
      const profileId = auth.user?.id;
      if (!profileId) throw new Error('Not signed in.');

      // resolve or create item
      let finalItemId = itemId;
      if (!useExistingItem) {
        const { data: created, error: itemErr } = await supabase
          .from('items')
          .insert({
            restaurant_id: restaurantId,
            name: newItemName.trim(),
            category: newItemCategory || null, // must match your domain type e.g. 'Drink'
          })
          .select('id')
          .single();
        if (itemErr) {
            console.log("here we failed (resolve or create item");
            throw itemErr
        };
        finalItemId = created!.id as string;
      }
      

      // upload image first (path uses item id)
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
      if (revErr) {
        console.log("here we failed create revioew");
        throw revErr;
      };
      

      // attach image to item, with provenance
      const { error: imgErr } = await supabase.from('item_images').insert({
        item_id: finalItemId,
        url: imageUrl,
        alt_text: null,
        sort_order: 0,
        is_primary: false,
        source_review_id: review!.id,
      });
      if (imgErr) { console.log("here we failed attach image to item");
        throw imgErr}
      ;

      // done — route wherever makes sense
      router.push(`/reviews/${profileId}`);
    } catch (err: unknown) {
      console.error(err);
    //   setError(err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 space-y-6">
      <h1 className="text-xl font-semibold">Create Review</h1>
      <label className="flex items-center gap-2 text-center">Please note that for now you can only review an existing item.</label>

      {error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Restaurant */}
        <div className="space-y-2">
          <Label htmlFor="restaurant">Restaurant</Label>
          <select
            id="restaurant"
            className="w-full rounded-md border p-2 dark:bg-gray-800"
            value={restaurantId}
            onChange={(e) => {
              setRestaurantId(e.target.value);
              setItemId('');
              setItems([]);
            }}
          >
            <option value="">Select a restaurant…</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Item choice */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            
            {/* <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={useExistingItem}
                onChange={() => setUseExistingItem(true)}
                disabled={!restaurantId}
              />
              Existing item
            </label> */}
            {/* <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!useExistingItem}
                onChange={() => setUseExistingItem(false)}
                disabled={!restaurantId}
              />
              Create new item
            </label> */}
          </div>

          {useExistingItem ? (
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <select
                id="item"
                className="w-full rounded-md border p-2 dark:bg-gray-800"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                disabled={!restaurantId || loadingItems}
              >
                <option value="">{loadingItems ? 'Loading items…' : 'Select an item…'}</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-name">New item name</Label>
                <Input
                  id="new-name"
                  placeholder="e.g. Iced Latte"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  disabled={!restaurantId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cat">Category</Label>
                <Input
                  id="new-cat"
                  placeholder="e.g. Drink"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  disabled={!restaurantId}
                />
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label>Image</Label>
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
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
            <Input
              id="body"
              
              placeholder="What did you think?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
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
