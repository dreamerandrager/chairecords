import { ReviewsSection } from "@/customComponents/reviews/reviewsSection";

export default function ReviewsByUserPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <ReviewsSection userId={id} title="Reviews" />
    </div>
  );
}
