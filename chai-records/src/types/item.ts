export type Item = {
  id: string;
  restaurantId: string;
  restaurantName: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  category: string;
  priceCents: number | null;
  currency: string;
  isActive: boolean;
  sku: string | null;
  metadata: Record<string, unknown> | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
