import { notFound } from "next/navigation";
import { getItemById } from "@/api/getItemById";
import { ItemDetailsCard } from "@/customComponents/items/itemDetailsCard";
import { ItemTabs } from "@/customComponents/items/itemTabs";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <ItemDetailsCard itemId={id} initialItem={item} />
      <ItemTabs itemId={id} itemName={item.name} />
    </div>
  );
}
