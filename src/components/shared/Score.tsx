import { getScoreColorClass, getScoreStatus } from "@/lib/score";

export function ScoreCircle({ score, size = "md" }: { score: number; size?: string }) {
  const color = getScoreColorClass(score);
  const dim =
    size === "xs" ? "w-8 h-8 text-xs"
    : size === "sm" ? "w-10 h-10 text-sm"
    : size === "lg" ? "w-16 h-16 text-xl"
    : size === "xl" ? "w-20 h-20 text-2xl"
    : size === "2xl" ? "w-24 h-24 text-3xl"
    : "w-14 h-14 text-lg";
  return (
    <div className={dim + " " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"}>
      {score}
    </div>
  );
}

export function StatusBadge({ score }: { score: number }) {
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
      <span className={"w-8 text-xs font-bold text-right " + (value >= 58 ? "text-emerald-700" : value >= 42 ? "text-yellow-600" : "text-orange-600")}>{value}</span>
    </div>
  );
}

export function MimoCard({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={"relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl shadow-sm " + (compact ? "p-3" : "p-4")}>
      <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
      <p className={"text-gray-800 mt-2 leading-relaxed " + (compact ? "text-xs" : "text-sm")}>{text}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, actionLabel }: {
  icon: string; title: string; description: string; action?: () => void; actionLabel?: string;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-3xl mb-3">{icon}</p>
      <h3 className="font-bold text-gray-600 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      {action && actionLabel && (
        <button onClick={action} className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm">
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
    <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
}
