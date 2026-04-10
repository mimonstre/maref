const GUIDE_MODULES = [
  { id: "g1", title: "Comprendre le Score MAREF", desc: "Comment est calcule le score et pourquoi il differe d une simple note.", progress: 65, lessons: 4, icon: "🎯" },
  { id: "g2", title: "Comprendre PEFAS", desc: "Les 5 axes qui structurent chaque evaluation.", progress: 40, lessons: 5, icon: "📊" },
  { id: "g3", title: "Mieux comparer", desc: "Les erreurs classiques de comparaison et comment les eviter.", progress: 0, lessons: 3, icon: "⚖️" },
  { id: "g4", title: "Raisonner long terme", desc: "Pourquoi le prix d achat n est qu une partie du cout reel.", progress: 0, lessons: 4, icon: "🔮" },
  { id: "g5", title: "Eviter les erreurs d achat", desc: "Les biais cognitifs qui influencent vos decisions.", progress: 20, lessons: 6, icon: "🛡️" },
  { id: "g6", title: "Comprendre les marchands", desc: "Comment evaluer la fiabilite d un distributeur.", progress: 0, lessons: 3, icon: "🏪" },
  { id: "g7", title: "Lire une fiche offre", desc: "Chaque element explique, chaque signal decode.", progress: 80, lessons: 4, icon: "📋" },
];

const FORMATION_PATHS = [
  { id: "f1", title: "Parcours Fondamentaux", desc: "Les bases de l achat intelligent.", modules: 4, duration: "45 min", level: "Debutant", progress: 30, icon: "🌱" },
  { id: "f2", title: "Parcours Analyse avancee", desc: "Maitriser la lecture multi-axes.", modules: 6, duration: "1h30", level: "Intermediaire", progress: 0, icon: "📈" },
  { id: "f3", title: "Parcours Expert", desc: "Devenir un decideur averti.", modules: 5, duration: "2h", level: "Avance", progress: 0, icon: "🏆" },
];

export default function GuidePage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Guide MAREF</h2>
        <p className="text-sm text-gray-500 mt-1">Apprenez a mieux decider. Chaque module vous rend plus autonome.</p>
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">Le Guide est votre allie pour comprendre comment MAREF fonctionne. Commencez par les modules en cours.</p>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-3">Modules</h3>
        {GUIDE_MODULES.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-2.5 flex gap-3 hover:shadow-md transition-all cursor-pointer">
            <span className="text-2xl">{m.icon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{m.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: m.progress + "%" }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{m.progress}% · {m.lessons} lecons</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold text-sm mb-3">Parcours de formation</h3>
        {FORMATION_PATHS.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-2.5 flex gap-3 hover:shadow-md transition-all cursor-pointer">
            <span className="text-2xl">{f.icon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{f.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              <div className="flex gap-1.5 flex-wrap mt-2">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{f.level}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{f.duration}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{f.modules} modules</span>
              </div>
              {f.progress > 0 && (
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: f.progress + "%" }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}