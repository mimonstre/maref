import type { ReactNode } from "react";
import { AlertTriangle, Database, FileWarning } from "lucide-react";
import { getScoreColorClass, getScoreStatus } from "@/lib/score";

export function ScoreCircle({ score, size = "md" }: { score: number | null | undefined; size?: string }) {
  const color = score === null || score === undefined ? "bg-slate-300" : getScoreColorClass(score);
  const dim =
    size === "xs" ? "w-8 h-8 text-xs"
    : size === "sm" ? "w-10 h-10 text-sm"
    : size === "lg" ? "w-16 h-16 text-xl"
    : size === "xl" ? "w-20 h-20 text-2xl"
    : size === "2xl" ? "w-24 h-24 text-3xl"
    : "w-14 h-14 text-lg";
  return (
    <div className={dim + " " + color + " score-pulse rounded-[32px] flex items-center justify-center text-white font-bold shrink-0 shadow-[0_14px_30px_rgba(37,99,235,0.18)] ring-4 ring-white/70"}>
      {score === null || score === undefined ? "--" : score}
    </div>
  );
}

export function StatusBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Score indisponible</span>;
  }
  const status = getScoreStatus(score);
  return <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + status.className}>{status.label}</span>;
}

export function AxisBar({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const color = getScoreColorClass(value);
  return (
    <div className={"flex items-center gap-2.5 mb-2" + (onClick ? " cursor-pointer" : "")} onClick={onClick}>
      <span className="w-24 text-xs font-semibold text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-700 " + color} style={{ width: value + "%" }}></div>
      </div>
      <span className={"w-8 text-xs font-bold text-right " + (value >= 58 ? "text-blue-700" : value >= 42 ? "text-yellow-600" : "text-orange-600")}>{value}</span>
    </div>
  );
}

export function MimoCard({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={"relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-sky-100 shadow-[0_18px_40px_rgba(37,99,235,0.10)] " + (compact ? "p-3" : "p-5")}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.28),transparent_26%)]"></div>
      <span className="absolute left-4 top-[-10px] rounded-full bg-gradient-to-r from-blue-700 to-sky-600 px-3 py-1 text-[0.68rem] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]">Mimo</span>
      <p className={"relative mt-3 text-gray-800 leading-relaxed " + (compact ? "text-xs" : "text-sm")}>{text}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, actionLabel }: {
  icon: ReactNode; title: string; description: string; action?: () => void; actionLabel?: string;
}) {
  return (
    <div className="premium-surface rounded-3xl px-6 py-14 text-center">
      <p className="text-3xl mb-3">{icon}</p>
      <h3 className="mb-1 font-bold text-slate-700">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      {action && actionLabel && (
        <button onClick={action} className="rounded-xl bg-gradient-to-r from-blue-700 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition-all hover:translate-y-[-1px] hover:from-blue-800 hover:to-sky-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ count = 3, type = "card" }: { count?: number; type?: string }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5 animate-pulse">
          {type === "card" ? (
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-fade-in rounded-2xl bg-gradient-to-r from-blue-700 to-sky-600 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)]">
      {message}
    </div>
  );
}

export function NoDataBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="premium-surface rounded-3xl p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function IncompleteDataWarning({ title = "Information incomplete", description }: { title?: string; description: string }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-[0_12px_28px_rgba(217,119,6,0.10)]">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-amber-200 bg-white p-2 text-amber-700">
          <FileWarning className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">{title}</h3>
          <p className="text-sm text-amber-800 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function DataTruthBadge({ label, state }: { label: string; state: "reliable" | "partial" | "unknown" }) {
  const tone =
    state === "reliable"
      ? "bg-blue-50 text-blue-800 border-blue-200"
      : state === "partial"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={"inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border " + tone}>
      <AlertTriangle className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
