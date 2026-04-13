import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/shared/Score";
import ExplorerPageClient from "@/features/explorer/ExplorerPageClient";

export default function ExplorerPage() {
  return (
    <Suspense fallback={<LoadingSkeleton count={4} />}>
      <ExplorerPageClient />
    </Suspense>
  );
}
