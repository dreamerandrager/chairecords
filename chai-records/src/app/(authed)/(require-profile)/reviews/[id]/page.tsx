import { ReviewsSection } from "@/customComponents/reviews/reviewsSection";

export default async function ReviewsByUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <ReviewsSection userId={id} title="Reviews" />
    </div>
  );
}
