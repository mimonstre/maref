"use client";

type PricePoint = {
  date: string;
  price: number;
  sourceUrl?: string | null;
};

function buildPath(points: PricePoint[]) {
  if (points.length === 0) return "";
  const minPrice = Math.min(...points.map((entry) => entry.price));
  const maxPrice = Math.max(...points.map((entry) => entry.price));
  const span = Math.max(1, maxPrice - minPrice);

  return points
    .map((entry, index) => {
      const x = 20 + (index * 280) / Math.max(1, points.length - 1);
      const y = 105 - ((entry.price - minPrice) / span) * 70;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  if (points.length === 0) return null;

  const sortedPoints = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pathData = buildPath(sortedPoints);
  const minPrice = Math.min(...sortedPoints.map((item) => item.price));
  const maxPrice = Math.max(...sortedPoints.map((item) => item.price));
  const span = Math.max(1, maxPrice - minPrice);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-950">Historique de prix</h3>
        <p className="mt-1 text-xs text-slate-500">Courbe basée sur les relevés réellement enregistrés pour l’offre sélectionnée.</p>
      </div>

      <svg viewBox="0 0 320 140" className="h-40 w-full overflow-visible">
        <path d={pathData} fill="none" stroke="#10294e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {sortedPoints.map((entry, index) => {
          const x = 20 + (index * 280) / Math.max(1, sortedPoints.length - 1);
          const y = 105 - ((entry.price - minPrice) / span) * 70;
          return (
            <g key={entry.date + entry.price}>
              <circle cx={x} cy={y} r="4" fill="#10294e" />
              <text x={x} y="126" textAnchor="middle" fontSize="10" fill="#64748b">
                {new Date(entry.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 space-y-2">
        {[...sortedPoints].reverse().map((entry) => (
          <div key={entry.date + entry.price} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{entry.price.toLocaleString("fr-FR")} €</p>
              <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString("fr-FR")}</p>
            </div>
            {entry.sourceUrl ? (
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300"
              >
                Source
              </a>
            ) : (
              <span className="text-xs text-slate-400">Source non liée</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
