"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { onQuestUnlocked } from "@/lib/core/questNotifications";

export default function GlobalQuestToast() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timeoutId: number | null = null;

    return onQuestUnlocked(({ message: nextMessage }) => {
      setMessage(nextMessage);
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setMessage(""), 5000);
    });
  }, []);

  if (!message) return null;

  return (
    <div className="fixed left-1/2 top-20 z-[70] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-950 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_48px_rgba(15,23,42,0.28)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Trophy className="h-4.5 w-4.5" />
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
}
