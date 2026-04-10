"use client";
import { useState } from "react";
import Link from "next/link";

const GUIDE_MODULES = [
  { id: "g1", title: "Comprendre le Score MAREF", desc: "Comment est calcule le score et pourquoi il differe d une simple note.", progress: 65, lessons: 4, icon: "🎯", difficulty: "Debutant", duration: "10 min",
    content: [
      "Le Score MAREF n est pas une simple moyenne. C est une evaluation multi-dimensionnelle qui combine 5 axes ponderes selon votre profil.",
      "Chaque axe (Pertinence, Economie, Fluidite, Assurance, Stabilite) contribue au score global avec un poids different.",
      "Le score integre egalement le niveau de confiance des donnees et la fraicheur des informations.",
      "Un score de 85+ est excellent, 70-84 tres bon, 55-69 correct, en dessous il faut etre vigilant."
    ]},
  { id: "g2", title: "Comprendre PEFAS", desc: "Les 5 axes qui structurent chaque evaluation.", progress: 40, lessons: 5, icon: "📊", difficulty: "Debutant", duration: "15 min",
    content: [
      "P = Pertinence : mesure l adequation entre le produit et votre besoin reel.",
      "E = Economie : evalue le rapport cout total / valeur delivree.",
      "F = Fluidite : mesure la facilite d acces a l offre.",
      "A = Assurance : evalue la fiabilite de l ecosysteme.",
      "S = Stabilite : mesure la constance dans le temps."
    ]},
  { id: "g3", title: "Mieux comparer", desc: "Les erreurs classiques de comparaison et comment les eviter.", progress: 0, lessons: 3, icon: "⚖️", difficulty: "Intermediaire", duration: "12 min",
    content: [
      "Comparer uniquement sur le prix est la premiere erreur. Le cout total etendu inclut l usage sur plusieurs annees.",
      "Les avis en ligne sont souvent biaises. Privilegiez les indicateurs objectifs comme la garantie et le SAV.",
      "Utilisez la comparaison MAREF pour confronter les offres sur les 5 axes PEFAS simultanement."
    ]},
  { id: "g4", title: "Raisonner long terme", desc: "Pourquoi le prix d achat n est qu une partie du cout reel.", progress: 0, lessons: 4, icon: "🔮", difficulty: "Intermediaire", duration: "15 min",
    content: [
      "Le cout total d un appareil = prix d achat + cout d usage annuel x nombre d annees.",
      "Un appareil moins cher a l achat peut couter plus cher sur 5 ans (energie, reparations).",
      "La classe energetique a un impact direct sur le cout d usage annuel.",
      "La durabilite et la qualite de fabrication reduisent le risque de remplacement premature."
    ]},
  { id: "g5", title: "Eviter les erreurs d achat", desc: "Les biais cognitifs qui influencent vos decisions.", progress: 20, lessons: 6, icon: "🛡️", difficulty: "Avance", duration: "20 min",
    content: [
      "Le biais d ancrage : le premier prix vu influence votre perception de tous les suivants.",
      "Le biais de confirmation : vous cherchez les infos qui confirment votre choix initial.",
      "L effet de rarete : la mention 'derniers stocks' pousse a acheter sans reflechir.",
      "Le biais du prix barre : une reduction n est pertinente que si le prix initial etait reel.",
      "L aversion a la perte : la peur de rater une promo est plus forte que le plaisir d un bon achat.",
      "MAREF vous protege de ces biais en fournissant une analyse objective et structuree."
    ]},
  { id: "g6", title: "Comprendre les marchands", desc: "Comment evaluer la fiabilite d un distributeur.", progress: 0, lessons: 3, icon: "🏪", difficulty: "Debutant", duration: "8 min",
    content: [
      "La politique de retour est un indicateur cle : 30 jours minimum est recommande.",
      "La garantie legale est de 2 ans, mais certains marchands offrent des extensions gratuites.",
      "Le SAV et la disponibilite du service client sont essentiels en cas de probleme."
    ]},
  { id: "g7", title: "Lire une fiche offre", desc: "Chaque element explique, chaque signal decode.", progress: 80, lessons: 4, icon: "📋", difficulty: "Debutant", duration: "10 min",
    content: [
      "Le Score MAREF global est votre premier indicateur. Regardez ensuite le statut associe.",
      "Les axes PEFAS vous montrent ou l offre excelle et ou elle est plus faible.",
      "La section Mimo vous donne une interpretation humaine et nuancee du score.",
      "Les points forts et vigilances sont les elements les plus actionnables de la fiche."
    ]},
];

const QUIZZES = [
  {
    id: "q1", title: "Les bases du Score MAREF", questions: [
      { q: "Le Score MAREF evalue :", options: ["Seulement le prix", "La pertinence globale d une offre contextualisee", "La popularite du produit", "La note des utilisateurs"], correct: 1 },
      { q: "PEFAS comporte combien d axes ?", options: ["3", "4", "5", "6"], correct: 2 },
      { q: "Que signifie le P de PEFAS ?", options: ["Prix", "Performance", "Pertinence", "Precision"], correct: 2 },
      { q: "Le cout total etendu inclut :", options: ["Seulement le prix d achat", "Le prix + la livraison", "Le prix + usage + couts indirects", "Le prix barre"], correct: 2 },
      { q: "Mimo est :", options: ["Un chatbot generique", "Une mascotte", "La couche d interpretation du moteur", "Un comparateur de prix"], correct: 2 },
    ]
  },
  {
    id: "q2", title: "Comparer efficacement", questions: [
      { q: "Comparer uniquement sur le prix est :", options: ["Suffisant", "Risque car incomplet", "La meilleure methode", "Inutile"], correct: 1 },
      { q: "La Fluidite dans PEFAS mesure :", options: ["La vitesse du produit", "La facilite d acces et de livraison", "Le design", "La fluidite de l eau"], correct: 1 },
      { q: "Un score de confiance Faible signifie :", options: ["Le produit est mauvais", "Les donnees disponibles sont insuffisantes", "Le marchand est frauduleux", "Le prix va augmenter"], correct: 1 },
    ]
  },
];

export default function GuidePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const module = GUIDE_MODULES.find((m) => m.id === activeModule);
  const quiz = QUIZZES.find((q) => q.id === activeQuiz);

  // ===== QUIZ VIEW =====
  if (quiz) {
    if (quizStep >= quiz.questions.length) {
      const correct = quizAnswers.filter((a, i) => a === quiz.questions[i].correct).length;
      const pct = Math.round((correct / quiz.questions.length) * 100);
      return (
        <div className="space-y-5">
          <button onClick={() => { setActiveQuiz(null); setQuizStep(0); setQuizAnswers([]); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            Retour
          </button>
          <div className="text-center py-6">
            <p className="text-4xl mb-3">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</p>
            <h2 className="text-2xl font-bold">{correct} / {quiz.questions.length}</h2>
            <p className="text-sm text-gray-500 mt-2">{pct >= 80 ? "Excellent ! Vous maitrisez le sujet." : pct >= 50 ? "Pas mal ! Quelques points a revoir." : "Continuez la formation pour progresser."}</p>
          </div>
          <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
            <p className="text-sm text-gray-800 mt-2">{pct >= 80 ? "Bravo, votre comprehension du systeme est solide." : "Je vous recommande de revoir les modules lies avant de retenter."}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setQuizStep(0); setQuizAnswers([]); }} className="flex-1 bg-emerald-700 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-800 transition-colors text-sm">Recommencer</button>
            <button onClick={() => { setActiveQuiz(null); setQuizStep(0); setQuizAnswers([]); }} className="flex-1 bg-white border border-gray-200 font-semibold py-2.5 rounded-xl hover:border-emerald-300 transition-colors text-sm">Retour au Guide</button>
          </div>
        </div>
      );
    }

    const question = quiz.questions[quizStep];
    return (
      <div className="space-y-5">
        <button onClick={() => { setActiveQuiz(null); setQuizStep(0); setQuizAnswers([]); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          Quitter le quiz
        </button>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Question {quizStep + 1} / {quiz.questions.length}</span>
          <span className="text-xs font-semibold text-emerald-700">{quiz.title}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: (quizStep / quiz.questions.length * 100) + "%" }}></div>
        </div>
        <h3 className="font-bold text-lg">{question.q}</h3>
        <div className="space-y-2.5">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setQuizAnswers([...quizAnswers, i]); setQuizStep(quizStep + 1); }}
              className="w-full text-left flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <span className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm font-medium">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ===== MODULE DETAIL VIEW =====
  if (module) {
    return (
      <div className="space-y-5">
        <button onClick={() => setActiveModule(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          Retour au Guide
        </button>

        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-3xl mb-3">{module.icon}</p>
          <h2 className="text-xl font-bold">{module.title}</h2>
          <p className="text-emerald-200 text-sm mt-1">{module.desc}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{module.difficulty}</span>
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{module.duration}</span>
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{module.lessons} lecons</span>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: module.progress + "%" }}></div>
          </div>
          <p className="text-[0.7rem] text-emerald-200 mt-1">{module.progress}% complete</p>
        </div>

        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
          <p className="text-sm text-gray-800 mt-2">Ce module vous aide a comprendre un aspect cle du produit. Prenez le temps de lire chaque section — elles sont courtes et ciblees.</p>
        </div>

        <div className="space-y-3">
          {module.content.map((lesson, i) => {
            const completed = i < Math.ceil(module.lessons * module.progress / 100);
            return (
              <div key={i} className={"bg-white rounded-xl border p-4 " + (completed ? "border-emerald-200" : "border-gray-200")}>
                <div className="flex items-start gap-3">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 " + (completed ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-400")}>
                    {completed ? "✓" : i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Lecon {i + 1}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{lesson}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== GUIDE LIST VIEW =====
  const totalProgress = Math.round(GUIDE_MODULES.reduce((sum, m) => sum + m.progress, 0) / GUIDE_MODULES.length);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Guide MAREF</h2>
        <p className="text-sm text-gray-500 mt-1">Apprenez a mieux decider. Chaque module vous rend plus autonome.</p>
      </div>

      {/* Global progress */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Votre progression</span>
          <span className="text-2xl font-extrabold">{totalProgress}%</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: totalProgress + "%" }}></div>
        </div>
        <p className="text-[0.7rem] text-emerald-200 mt-2">{GUIDE_MODULES.filter(m => m.progress === 100).length} / {GUIDE_MODULES.length} modules termines</p>
      </div>

      {/* Mimo */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">Le Guide est votre allie pour comprendre comment MAREF fonctionne. Commencez par les modules en cours — chaque lecon est courte et actionnable.</p>
      </div>

      {/* Modules */}
      <div>
        <h3 className="font-bold mb-3">Modules</h3>
        <div className="space-y-2.5">
          {GUIDE_MODULES.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3.5 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{m.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{m.title}</h4>
                  {m.progress > 0 && m.progress < 100 && (
                    <span className="text-[0.65rem] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">En cours</span>
                  )}
                  {m.progress === 100 && (
                    <span className="text-[0.65rem] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Termine</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: m.progress + "%" }}></div>
                  </div>
                  <span className="text-[0.65rem] text-gray-400 shrink-0">{m.progress}%</span>
                </div>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[0.65rem] text-gray-400">{m.difficulty}</span>
                  <span className="text-[0.65rem] text-gray-400">·</span>
                  <span className="text-[0.65rem] text-gray-400">{m.duration}</span>
                  <span className="text-[0.65rem] text-gray-400">·</span>
                  <span className="text-[0.65rem] text-gray-400">{m.lessons} lecons</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz */}
      <div>
        <h3 className="font-bold mb-3">Quiz</h3>
        <div className="space-y-2.5">
          {QUIZZES.map((q) => (
            <div
              key={q.id}
              onClick={() => { setActiveQuiz(q.id); setQuizStep(0); setQuizAnswers([]); }}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg shrink-0">📝</div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{q.title}</h4>
                <p className="text-xs text-gray-500">{q.questions.length} questions</p>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/assistant" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="text-sm font-semibold">Demander a Mimo</span>
        </Link>
        <Link href="/forum" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="text-sm font-semibold">Forum</span>
        </Link>
      </div>
    </div>
  );
}