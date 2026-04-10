import { PROJECTS, OFFERS } from "@/lib/data";

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  return (
    <div className={"w-10 h-10 text-sm " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0"}>
      {score}
    </div>
  );
}

export default function ProjetsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vos projets</h2>
        <button className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
          + Creer
        </button>
      </div>

      {PROJECTS.map((p) => {
        const projectOffers = p.offers.map((id) => OFFERS.find((o) => o.id === id)).filter(Boolean);
        return (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.category} · {p.budget}</p>
              </div>
              {p.score > 0 ? (
                <ScoreCircle score={p.score} />
              ) : (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Nouveau</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{p.objective}</p>
            <div className="flex items-center justify-between">
              <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + (p.state === "En cours" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600")}>
                {p.state}
              </span>
              <span className="text-xs text-gray-400">
                {p.offers.length} offre{p.offers.length > 1 ? "s" : ""} · {p.updatedAt}
              </span>
            </div>

            {projectOffers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Offres du projet</p>
                {projectOffers.slice(0, 2).map((o) => o && (
                  <div key={o.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</span>
                      <span className="text-sm font-medium truncate">{o.brand} {o.product}</span>
                    </div>
                    <span className="text-xs font-bold">{o.price.toLocaleString("fr-FR")} EUR</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">
          Vos projets vous aident a structurer vos decisions. Ajoutez des offres depuis l explorateur pour enrichir votre analyse.
        </p>
      </div>
    </div>
  );
}