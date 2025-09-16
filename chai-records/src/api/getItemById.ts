// api/getItemById.ts
import type { Item } from "@/types/item";
import { supabase } from "@/utils/supabase/supabase";

type RawImage = {
  url?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

type Metadata = Record<string, unknown> | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickImageFromMetadata(metadata: Metadata): string | null {
  if (!metadata) return null;

  const candidates: string[] = [];
  const preferredKeys = [
    "imageUrl",
    "image_url",
    "photoUrl",
    "photo_url",
    "thumbnailUrl",
    "thumbnail_url",
    "image",
  ];

  for (const key of preferredKeys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      candidates.push(value.trim());
    }
  }

  const images = metadata["images"];
  if (Array.isArray(images)) {
    for (const entry of images) {
      if (typeof entry === "string" && entry.trim().length > 0) {
        candidates.push(entry.trim());
        continue;
      }

      if (isRecord(entry)) {
        for (const key of preferredKeys) {
          const value = entry[key];
          if (typeof value === "string" && value.trim().length > 0) {
            candidates.push(value.trim());
          }
        }

        const nestedUrl = entry["url"];
        if (typeof nestedUrl === "string" && nestedUrl.trim().length > 0) {
          candidates.push(nestedUrl.trim());
        }
      }
    }
  }

  return candidates.find((url) => url.length > 0) ?? null;
}

function pickImageFromGallery(images: RawImage[] | undefined, metadata: Metadata): string | null {
  if (Array.isArray(images) && images.length > 0) {
    const sorted = [...images].sort((a, b) => {
      const primaryA = a?.is_primary ? 1 : 0;
      const primaryB = b?.is_primary ? 1 : 0;
      if (primaryA !== primaryB) return primaryB - primaryA;

      const orderA = typeof a?.sort_order === "number" ? a.sort_order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b?.sort_order === "number" ? b.sort_order : Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    for (const image of sorted) {
      const url = image?.url;
      if (typeof url === "string" && url.trim().length > 0) {
        return url.trim();
      }
    }
  }

  return pickImageFromMetadata(metadata);
}

export async function getItemById(id: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from("items")
    .select(`
      id,
      restaurant_id,
      name,
      slug,
      description,
      category,
      price_cents,
      currency,
      is_active,
      sku,
      metadata,
      created_at,
      updated_at,
      restaurant:restaurants (
        id,
        name
      ),
      images:item_images (
        url,
        is_primary,
        sort_order
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const metadata = (row.metadata ?? null) as Metadata;

  let priceCents: number | null = null;
  if (typeof row.price_cents === "number") {
    priceCents = row.price_cents;
  } else if (typeof row.price_cents === "string") {
    const parsed = Number(row.price_cents);
    priceCents = Number.isFinite(parsed) ? parsed : null;
  }

  const rawCurrency =
    typeof row.currency === "string" && row.currency.trim().length > 0
      ? row.currency.trim()
      : String(row.currency ?? "ZAR");
  const currency = rawCurrency.toUpperCase();
  const imageUrl = pickImageFromGallery(row.images as RawImage[] | undefined, metadata);

  return {
    id: row.id as string,
    restaurantId: row.restaurant_id as string,
    restaurantName: (row.restaurant?.name ?? null) as string | null,
    name: row.name as string,
    slug: (row.slug ?? null) as string | null,
    description: (row.description ?? null) as string | null,
    category: row.category as string,
    priceCents,
    currency,
    isActive: Boolean(row.is_active),
    sku: (row.sku ?? null) as string | null,
    metadata,
    imageUrl: imageUrl ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  } satisfies Item;
}