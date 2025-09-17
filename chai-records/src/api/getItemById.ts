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

type RpcRow = {
  item_id: string;             // function returns item_id as the first column
  restaurant_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string;            // public.item_category
  price_cents: number | null;
  currency: string | null;     // char(3)
  is_active: boolean;
  created_at: string;
  updated_at: string;
  single_facets?: unknown;
  multi_facets?: unknown;
};

type RpcSingleFacet = {
  facet_name?: unknown;
  name?: unknown;
  value?: unknown;
  facet_value?: unknown;
};

type RpcMultiFacetValue = {
  value?: unknown;
  facet_value?: unknown;
};

type RpcMultiFacet = {
  facet_name?: unknown;
  name?: unknown;
  values?: unknown;
};

function getFacetLabel(raw: unknown): string | null {
  if (typeof raw === "string") return raw.trim().length > 0 ? raw.trim() : null;
  return null;
}

function parseSingleFacet(raw: unknown): ItemFacetSummary["singleFacet"] {
  if (!Array.isArray(raw)) return null;

  for (const entry of raw as RpcSingleFacet[]) {
    if (!entry || typeof entry !== "object") continue;

    const name = getFacetLabel((entry as RpcSingleFacet).facet_name ?? (entry as RpcSingleFacet).name);
    const value = getFacetLabel((entry as RpcSingleFacet).value ?? (entry as RpcSingleFacet).facet_value);

    if (name && value) return { name, value };
  }

  return null;
}

function parseMultiFacetValues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const values: string[] = [];
  for (const entry of raw as RpcMultiFacetValue[]) {
    if (!entry || typeof entry !== "object") continue;
    const label = getFacetLabel(entry.value ?? entry.facet_value);
    if (label) values.push(label);
    if (values.length >= 3) break;
  }
  return values;
}

function parseMultiFacets(raw: unknown): ItemFacetSummary["multiFacets"] {
  if (!Array.isArray(raw)) return [];

  const facets: ItemFacetSummary["multiFacets"] = [];
  for (const entry of raw as RpcMultiFacet[]) {
    if (!entry || typeof entry !== "object") continue;

    const name = getFacetLabel(entry.facet_name ?? entry.name);
    if (!name) continue;

    const values = parseMultiFacetValues(entry.values);
    if (values.length === 0) continue;

    facets.push({ name, values });
    if (facets.length >= 3) break;
  }

  return facets;
}

export async function getItemById(id: string): Promise<Item | null> {
  // 1) core item + consensus facets via RPC (typed table)
  const { data: rpcRows, error: rpcErr } = await supabase.rpc("get_item_by_id_typed", {
    p_item_id: id,
  });

  if (rpcErr) throw rpcErr;
  const row = (rpcRows as RpcRow[] | null)?.[0];
  if (!row) return null;

  // 2) fetch restaurant name + gallery images in parallel
  const [{ data: rest, error: restErr }, { data: imgs, error: imgErr }] = await Promise.all([
    supabase.from("restaurants").select("id,name").eq("id", row.restaurant_id).maybeSingle(),
    supabase.from("item_images").select("url,is_primary,sort_order").eq("item_id", id),
  ]);
  if (restErr) throw restErr;
  if (imgErr) throw imgErr;

  // 3) normalize types
  const metadata = null as Metadata; // RPC doesn’t include metadata; keep null to preserve Item shape
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

  const consensusFacets: ItemFacetSummary = {
    singleFacet: parseSingleFacet(row.single_facets),
    multiFacets: parseMultiFacets(row.multi_facets),
  };

  return {
    id: row.item_id, // note: RPC returns item_id
    restaurantId: row.restaurant_id,
    restaurantName: (rest?.name ?? null) as string | null,
    name: row.name,
    slug: row.slug ?? null,
    description: row.description ?? null,
    category: row.category,
    priceCents,
    currency,
    isActive: Boolean(row.is_active),
    sku: null,                  // not included by RPC; keep null to preserve type
    metadata,
    imageUrl: imageUrl ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    consensusFacets,
  } satisfies Item;
}
