// api/getRestaurantById.ts
import type { Restaurant } from "@/types/restaurant";
import { supabase } from "@/utils/supabase/supabase";

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      id,
      name,
      slug,
      description,
      phone,
      email,
      website_url,
      address_line1,
      address_line2,
      city,
      region,
      postal_code,
      country_code,
      latitude,
      longitude,
      is_active,
      created_at,
      updated_at,
      brand_id,
      brand:brands (
        id,
        name
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;

  return {
    id: row.id as string,
    name: row.name as string,
    slug: (row.slug ?? null) as string | null,
    description: (row.description ?? null) as string | null,
    phone: (row.phone ?? null) as string | null,
    email: (row.email ?? null) as string | null,
    websiteUrl: (row.website_url ?? null) as string | null,
    addressLine1: (row.address_line1 ?? null) as string | null,
    addressLine2: (row.address_line2 ?? null) as string | null,
    city: (row.city ?? null) as string | null,
    region: (row.region ?? null) as string | null,
    postalCode: (row.postal_code ?? null) as string | null,
    countryCode: (row.country_code ?? null) as string | null,
    latitude: (row.latitude ?? null) as number | null,
    longitude: (row.longitude ?? null) as number | null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    brandId: (row.brand_id ?? null) as string | null,
    brandName: (row.brand?.name ?? null) as string | null,
  };
}
