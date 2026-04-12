"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmptyState, LoadingSkeleton } from "@/components/shared/Score";

export default function AuthRequiredPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (user) {
    return null;
  }

  return (
    <EmptyState
      icon={<Lock className="h-8 w-8 text-gray-400" />}
      title={title}
      description={description}
      action={() => {
        window.location.href = "/login";
      }}
      actionLabel="Se connecter"
    />
  );
}
