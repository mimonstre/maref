import type { ReactNode } from "react";
import { AlertTriangle, Database, FileWarning } from "lucide-react";
import { getScoreColorClass, getScoreStatus } from "@/lib/score";

export function ScoreCircle({ score, size = "md" }: { score: number | null | undefined; size?: string }) {
  const color = score === null || score === undefined ? "bg-slate-300" : getScoreColorClass(score);
  const dim =
    size === "xs" ? "h-8 w-8 text-xs"
    : size === "sm" ? "h-10 w-10 text-sm"
    : size === "lg" ? "h-16 w-16 text-xl"
    : size === "xl" ? "h-20 w-20 text-2xl"
    : size === "2xl" ? "h-24 w-24 text-3xl"
    : "h-14 w-14 text-lg";

  return (
    <div
      className={
        dim +
        " " +
        color +
        " score-pulse flex shrink-0 items-center justify-center rounded-[30px] font-bold text-white shadow-[0_16px_32px_rgba(15,23,42,0.16)] ring-4 ring-white/70"
      }
    >
      {score === null || score === undefined ? "--" : score}
    </div>
  );
}

export function StatusBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
        Score indisponible
      </span>
    );
  }

  const status = getScoreStatus(score);
  return <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + status.className}>{status.label}</span>;
}

export function AxisBar({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const color = getScoreColorClass(value);
  const valueTone =
    value >= 91 ? "text-green-700"
    : value >= 76 ? "text-green-600"
    : value >= 61 ? "text-yellow-600"
    : value >= 41 ? "text-orange-600"
    : "text-red-600";

  return (
    <div className={"mb-2 flex items-center gap-2.5" + (onClick ? " cursor-pointer" : "")} onClick={onClick}>
      <span className="w-24 shrink-0 text-xs font-semibold text-slate-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={"h-full rounded-full transition-all duration-700 " + color} style={{ width: value + "%" }}></div>
      </div>
      <span className={"w-8 text-right text-xs font-bold " + valueTone}>{value}</span>
    </div>
  );
}

export function MimoCard({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white shadow-[0_22px_44px_rgba(15,23,42,0.2)] " +
        (compact ? "p-4 pt-12" : "p-5 pt-13")
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_26%)]"></div>
      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-blue-50">
        Mimo
      </span>
      <p className={"relative leading-relaxed text-blue-50/92 " + (compact ? "text-xs" : "text-sm")}>{text}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="premium-surface rounded-[30px] px-6 py-14 text-center">
      <p className="mb-3 text-3xl">{icon}</p>
      <h3 className="mb-1 font-bold text-slate-800">{title}</h3>
      <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition-all hover:translate-y-[-1px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ count = 3, type = "card" }: { count?: number; type?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="premium-card animate-pulse rounded-[24px] p-4">
          {type === "card" ? (
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 rounded-[20px] bg-slate-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-slate-200"></div>
                <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                <div className="h-3 w-1/2 rounded bg-slate-200"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-4 w-1/3 rounded bg-slate-200"></div>
              <div className="h-3 w-2/3 rounded bg-slate-200"></div>
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
    <div className="fixed left-1/2 top-22 z-50 -translate-x-1/2 animate-fade-in rounded-[20px] bg-gradient-to-r from-slate-950 to-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_22px_44px_rgba(15,23,42,0.24)]">
      {message}
    </div>
  );
}

export function NoDataBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="premium-surface rounded-[26px] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-[18px] bg-slate-100 p-2 text-slate-600">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function IncompleteDataWarning({
  title = "Information incomplète",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-[0_12px_28px_rgba(217,119,6,0.1)]">
      <div className="flex items-start gap-3">
        <div className="rounded-[18px] border border-amber-200 bg-white p-2 text-amber-700">
          <FileWarning className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-amber-800">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function DataTruthBadge({ label, state }: { label: string; state: "reliable" | "partial" | "unknown" }) {
  const tone =
    state === "reliable"
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : state === "partial"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold " + tone}>
      <AlertTriangle className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
