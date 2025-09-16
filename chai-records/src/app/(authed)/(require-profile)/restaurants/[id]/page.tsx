import { notFound } from "next/navigation";
import { getRestaurantById } from "@/api/getRestaurantById";
import { RestaurantDetails } from "@/customComponents/restaurants/restaurantDetails";
import { RestaurantTabs } from "@/customComponents/restaurants/restaurantTabs";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <RestaurantDetails restaurant={restaurant} />
      <RestaurantTabs restaurantId={restaurant.id} restaurantName={restaurant.name} />
    </div>
  );
}
