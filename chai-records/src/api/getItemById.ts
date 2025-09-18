// api/getItemById.ts
import type { Item, ItemFacetSummary } from "@/types/item";
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


function parseSingleFacet(j: unknown) {
  if (!j || typeof j !== "object") return null;
  const o = j as { name?: string; value?: string };
  if (!o.name || !o.value) return null;
  return { name: String(o.name), value: String(o.value) };
}


function parseMultiFacets(j: unknown) {
  if (!j || typeof j !== "object") return [];
  const o = j as { name?: string; values?: unknown };
  const name = o.name ? String(o.name) : "Attribute";
  const values = Array.isArray(o.values) ? o.values.map(String).filter(Boolean) : [];
  return values.length ? [{ name, values }] : [];
}
export async function getItemById(id: string): Promise<Item | null> {
  // Call the JSONB RPC you implemented in SQL
  // (rename 'get_item_by_id_with_facets' here if your function name is different)
  const { data: rpcData, error: rpcErr } = await supabase.rpc(
    "get_item_by_id_with_facets",
    { p_item_id: id }
  );
  if (rpcErr) throw rpcErr;

  // Your function may return either a single jsonb or SETOF jsonb;
  // normalize to a single object.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: any | null = Array.isArray(rpcData) ? rpcData[0] ?? null : (rpcData ?? null);
  if (!row) return null;

  // Fetch restaurant name & gallery images in parallel
  const [{ data: rest, error: restErr }, { data: imgs, error: imgErr }] = await Promise.all([
    supabase.from("restaurants").select("id,name").eq("id", row.restaurant_id).maybeSingle(),
    supabase.from("item_images").select("url,is_primary,sort_order").eq("item_id", id),
  ]);
  if (restErr) throw restErr;
  if (imgErr) throw imgErr;

  // Normalize types
  const metadata = (row.metadata ?? null) as Record<string, unknown> | null;

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

  const imageUrl = pickImageFromGallery(imgs as RawImage[] | undefined, metadata);

  const consensusFacets = {
    singleFacet: parseSingleFacet(row.single_facets),
    multiFacets: parseMultiFacets(row.multi_facets),
  };

  console.log("getItemById: consensusFacets =", consensusFacets);

  return {
    id: row.id,                                // note: RPC includes the items.* columns
    restaurantId: row.restaurant_id,
    restaurantName: (rest?.name ?? null) as string | null,
    name: row.name,
    slug: (row.slug ?? null) as string | null,
    description: (row.description ?? null) as string | null,
    category: row.category as string,
    priceCents,
    currency,
    isActive: Boolean(row.is_active),
    sku: (row.sku ?? null) as string | null,   // available via to_jsonb(i)
    metadata,
    imageUrl: imageUrl ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    consensusFacets,
  } satisfies Item;
}