export type Review = {
  id: string;
  profileId: string;
  createdAt: string;
  rating: number;
  body: string | null;
  itemId: string;
  itemName: string;
  restaurantId: string;
  restaurantName: string;
  photoUrl: string | null;
  singleFacet?: { name: string; value: string } | null;
  multiFacet?: { name: string; values: string[] } | null;
};

