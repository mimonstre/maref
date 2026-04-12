import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/shared/Score";
import ComparePageClient from "@/features/compare/ComparePageClient";

export default function ComparerPage() {
  return (
    <Suspense fallback={<LoadingSkeleton count={3} />}>
      <ComparePageClient />
    </Suspense>
  );
}
