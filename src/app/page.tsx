import { OFFERS, PROJECTS, USER } from '@/lib/data';
import Link from 'next/link';

function ScoreCircle({ score, size = 'md' }: { score: number; size?: string }) {
  const color = score >= 85 ? 'bg-emerald-700' : score >= 72 ? 'bg-emerald-600' : score >= 58 ? 'bg-lime-600' : score >= 42 ? 'bg-yellow-500' : score >= 25 ? 'bg-orange-500' : 'bg-red-600';
  const dim = size === 'sm' ? 'w-10 h-10 text-sm' : size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';
  return <div className={dim + ' ' + color + ' rounded-full flex items-center justify-center text-white font-bold shrink-0'}>{score}</div>;
}

function StatusBadge({ score }: { score: number }) {
  const s = score >= 85 ? { l: 'Excellent choix', c: 'bg-emerald-100 text-emerald-800' } : score >= 72 ? { l: 'Très bon choix', c: 'bg-emerald-50 text-emerald-700' } : score >= 58 ? { l: 'Bon choix', c: 'bg-lime-100 text-lime-700' } : score >= 42 ? { l: 'À surveiller', c: 'bg-yellow-100 text-yellow-700' } : score >= 25 ? { l: 'Risqué', c: 'bg-orange-100 text-orange-700' } : { l: 'Peu pertinent', c: 'bg-red-100 text-red-700' };
  return <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + s.c}>{s.l}</span>;
}

export default function HomePage() {
  const topOffers = [...OFFERS].sort((a, b) => b.score - a.score).slice(0, 3);
  return (
    <div className="space-y-5">
      {/* Salutation */}
      <div>
        <h2 className="text-xl font-bold">Bonjour, {USER.name} 👋</h2>
        <p className="text-sm text-gray-500">Votre espace décisionnel est à jour.</p>
      </div>

      {/* Mimo du jour */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">Aujourd hui, 3 offres de votre projet Cuisine complete ont evolue. Le Samsung EcoClean 8kg a baisse de 12% chez Darty — une opportunite a analyser.</p>
      </div>

      {/* Profil résumé */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">Votre profil</span>
          <Link href="/profil" className="text-xs font-semibold text-emerald-700">Modifier</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold">{USER.initials}</div>
          <div className="flex-1">
            <h4 className="font-bold">{USER.name}</h4>
            <div className="flex gap-1.5 flex-wrap mt-1">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">{USER.priority}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{USER.budget}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{USER.horizon}</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">{USER.grade}</span>
        </div>
      </div>

      {/* Projets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm">Projets en cours</span>
          <Link href="/projets" className="text-xs font-semibold text-emerald-700">Tous</Link>
        </div>
        {PROJECTS.filter(p => p.state === 'En cours').map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{p.name}</h4>
                <p className="text-xs text-gray-500">{p.category} · {p.budget} · {p.offers.length} offres</p>
              </div>
              {p.score > 0 && <ScoreCircle score={p.score} size="sm" />}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{p.objective}</p>
          </div>
        ))}
      </div>

      {/* Recommandations */}
      <div>
        <span className="font-bold text-sm">Recommandations personnalisées</span>
        <div className="space-y-2.5 mt-3">
          {topOffers.map(o => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                {o.category === 'electromenager' ? '🏠' : o.category === 'froid' ? '❄️' : '📺'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p>
                <p className="font-semibold text-sm truncate">{o.product}</p>
                <p className="text-xs text-gray-400">{o.merchant} · {o.availability}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div>
                    <span className="font-bold">{o.price.toLocaleString('fr-FR')} €</span>
                    {o.barredPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{o.barredPrice.toLocaleString('fr-FR')} €</span>}
                  </div>
                  <ScoreCircle score={o.score} size="sm" />
                </div>
                <div className="mt-1"><StatusBadge score={o.score} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
