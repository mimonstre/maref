"use client";

import Link from "next/link";
import { BookOpen, Bot, ChevronRight, MessageSquare, PencilLine } from "lucide-react";
import { useState } from "react";
import AuthRequiredPage from "@/components/auth/AuthRequiredPage";
import { useAuth } from "@/components/auth/AuthProvider";
import { MimoCard } from "@/components/shared/Score";
import { GUIDE_CATEGORIES, GUIDE_MODULES, GUIDE_QUIZZES } from "@/features/guide/content";

function readGuideProgress() {
  if (typeof window === "undefined") return {};
  try {
    const saved = window.localStorage.getItem("maref_guide_progress");
    return saved ? (JSON.parse(saved) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function readCompletedQuizzes() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const saved = window.localStorage.getItem("maref_completed_quizzes");
    return saved ? new Set<string>(JSON.parse(saved) as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export default function GuidePage() {
  const { user, loading } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>(readGuideProgress);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(readCompletedQuizzes);

  function markLessonComplete(moduleId: string, lessonIndex: number, totalLessons: number) {
    const newProgressValue = Math.round(((lessonIndex + 1) / totalLessons) * 100);
    setModuleProgress((prev) => {
      const current = prev[moduleId] ?? 0;
      if (newProgressValue <= current) return prev;
      const next = { ...prev, [moduleId]: newProgressValue };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("maref_guide_progress", JSON.stringify(next));
      }
      return next;
    });
  }

  function saveQuizCompleted(quizId: string) {
    setCompletedQuizzes((prev) => {
      const next = new Set(prev);
      next.add(quizId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("maref_completed_quizzes", JSON.stringify([...next]));
      }
      return next;
    });
  }

  const totalProgress =
    GUIDE_MODULES.length > 0
      ? Math.round(GUIDE_MODULES.reduce((sum, moduleItem) => sum + (moduleProgress[moduleItem.id] ?? 0), 0) / GUIDE_MODULES.length)
      : 0;

  const selectedCategory = GUIDE_CATEGORIES.find((item) => item.id === activeCategory) || null;
  const modulesForCategory = GUIDE_MODULES.filter((item) => item.categoryId === activeCategory);
  const quizzesForCategory = GUIDE_QUIZZES.filter((item) => item.categoryId === activeCategory);
  const currentModule = GUIDE_MODULES.find((item) => item.id === activeModule) || null;
  const currentQuiz = GUIDE_QUIZZES.find((item) => item.id === activeQuiz) || null;

  if (loading || !user) {
    return (
      <AuthRequiredPage
        title="Guide réservé aux comptes connectés"
        description="Connectez-vous pour suivre vos modules, vos quiz et votre progression d apprentissage."
      />
    );
  }

  if (currentQuiz) {
    if (quizStep >= currentQuiz.questions.length) {
      const correct = quizAnswers.filter((answer, index) => answer === currentQuiz.questions[index].correct).length;
      const pct = Math.round((correct / currentQuiz.questions.length) * 100);
      const passed = pct >= 70;

      return (
        <div className="space-y-5">
          <button
            onClick={() => {
              if (passed && !completedQuizzes.has(currentQuiz.id)) saveQuizCompleted(currentQuiz.id);
              setActiveQuiz(null);
              setQuizStep(0);
              setQuizAnswers([]);
            }}
            className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-950"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Retour au guide
          </button>

          <div className="premium-hero rounded-[32px] p-6 text-white">
            <div className="relative z-10">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100/80">Résultat du quiz</p>
              <h2 className="mt-3 text-3xl font-black">
                {correct} / {currentQuiz.questions.length}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-blue-100/90">
                {passed
                  ? "Très bien. Vous avez validé les réflexes essentiels de cette thématique."
                  : "Le socle n est pas encore assez solide. Revenez sur le module puis retentez le quiz à froid."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="premium-card rounded-[28px] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-blue-950">Niveau atteint</p>
              <p className="mt-3 text-2xl font-black text-slate-950">{pct}%</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {passed ? "Quiz validé. Vous pouvez passer au module suivant ou approfondir ce thème." : "Quiz non validé. Mieux vaut consolider la méthode avant de continuer."}
              </p>
            </div>
            <MimoCard
              text={
                passed
                  ? "Bon signal : vous avez maintenant une base assez propre pour utiliser ce cadre dans vos projets et vos comparaisons."
                  : "Le vrai objectif n est pas de cocher un quiz, mais de rendre vos décisions plus robustes. Reprenez les leçons, puis revenez."
              }
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => {
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="rounded-2xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-950"
            >
              Recommencer
            </button>
            <button
              onClick={() => {
                if (passed && !completedQuizzes.has(currentQuiz.id)) saveQuizCompleted(currentQuiz.id);
                setActiveQuiz(null);
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
            >
              Retour au guide
            </button>
          </div>
        </div>
      );
    }

    const question = currentQuiz.questions[quizStep];
    const progressPercent = ((quizStep + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="space-y-5">
        <button
          onClick={() => {
            setActiveQuiz(null);
            setQuizStep(0);
            setQuizAnswers([]);
          }}
          className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-950"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Quitter le quiz
        </button>

        <div className="premium-surface rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-blue-950">Quiz</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{currentQuiz.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{currentQuiz.description}</p>
            </div>
            <div className="rounded-[22px] bg-slate-100 px-4 py-3 text-right">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Question</p>
              <p className="mt-1 text-lg font-black text-blue-950">
                {quizStep + 1}/{currentQuiz.questions.length}
              </p>
            </div>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-950 transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="premium-card rounded-[28px] p-6">
          <h3 className="text-xl font-black text-slate-950">{question.q}</h3>
          <div className="mt-5 space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuizAnswers([...quizAnswers, index]);
                  setQuizStep(quizStep + 1);
                }}
                className="flex w-full items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-900 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-blue-950">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm font-medium text-slate-800">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentModule) {
    const currentProgress = moduleProgress[currentModule.id] ?? 0;
    const totalLessons = currentModule.content.length;

    return (
      <div className="space-y-5">
        <button onClick={() => setActiveModule(null)} className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-950">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Retour à la catégorie
        </button>

        <div className="premium-hero rounded-[32px] p-6 text-white">
          <div className="relative z-10">
            <p className="text-3xl">{currentModule.icon}</p>
            <p className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100/80">Module</p>
            <h2 className="mt-2 text-3xl font-black">{currentModule.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100/90">{currentModule.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{currentModule.difficulty}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{currentModule.duration}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{currentModule.content.length} leçons</span>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${currentProgress}%` }}></div>
            </div>
          </div>
        </div>

        <MimoCard text="Ici, chaque leçon doit vous rendre meilleur dans une vraie décision d achat. Le but n est pas d apprendre du jargon, mais de construire des réflexes utiles." />

        <div className="space-y-4">
          {currentModule.content.map((lesson, index) => {
            const lessonProgressThreshold = Math.round(((index + 1) / totalLessons) * 100);
            const completed = currentProgress >= lessonProgressThreshold;

            return (
              <div key={index} className={"premium-card rounded-[28px] p-5 " + (completed ? "border-slate-300" : "")}>
                <div className="flex items-start gap-4">
                  <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold " + (completed ? "bg-blue-950 text-white" : "bg-slate-100 text-slate-500")}>
                    {completed ? "OK" : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">Leçon {index + 1}</p>
                    <h3 className="mt-2 text-lg font-black text-slate-950">{lesson.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.body}</p>
                    {!completed && (
                      <button
                        onClick={() => markLessonComplete(currentModule.id, index, totalLessons)}
                        className="mt-4 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-blue-950 transition-colors hover:bg-slate-100"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="space-y-5">
        <button onClick={() => setActiveCategory(null)} className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-950">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Retour aux catégories
        </button>

        <div className="premium-surface rounded-[30px] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl">{selectedCategory.icon}</p>
              <p className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">{selectedCategory.title}</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Modules et quiz de cette catégorie</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{selectedCategory.description}</p>
            </div>
            <div className="rounded-[24px] bg-slate-100 px-4 py-3 text-right">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Contenu</p>
              <p className="mt-1 text-sm font-black text-blue-950">
                {modulesForCategory.length} modules · {quizzesForCategory.length} quiz
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-black text-slate-950">Modules</h3>
          <div className="space-y-3">
            {modulesForCategory.map((moduleItem) => {
              const progress = moduleProgress[moduleItem.id] ?? 0;
              return (
                <button
                  key={moduleItem.id}
                  onClick={() => setActiveModule(moduleItem.id)}
                  className="premium-card flex w-full items-start gap-4 rounded-[28px] p-5 text-left transition-all hover:translate-y-[-2px]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-slate-100 text-2xl">
                    {moduleItem.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-base font-black text-slate-950">{moduleItem.title}</h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold text-blue-950">
                        {progress}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{moduleItem.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{moduleItem.difficulty}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{moduleItem.duration}</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-blue-950" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-black text-slate-950">Quiz</h3>
          <div className="space-y-3">
            {quizzesForCategory.map((quizItem) => (
              <button
                key={quizItem.id}
                onClick={() => {
                  setActiveQuiz(quizItem.id);
                  setQuizStep(0);
                  setQuizAnswers([]);
                }}
                className="premium-card flex w-full items-center gap-4 rounded-[28px] p-5 text-left transition-all hover:translate-y-[-2px]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-slate-100 text-blue-950">
                  <PencilLine className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-black text-slate-950">{quizItem.title}</h4>
                    {completedQuizzes.has(quizItem.id) && (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-[0.65rem] font-semibold text-blue-950">Validé</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{quizItem.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {quizItem.questions.length} questions
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="premium-hero rounded-[32px] p-6 text-white">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100">
            <BookOpen className="h-3.5 w-3.5" />
            Guide MAREF
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight">Monter en compétence avant d acheter</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100/90">
            Le guide est organisé par thématiques utiles : choisir le bon appareil, comprendre une offre, comparer proprement et décider avec plus de recul.
          </p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
            <span className="text-sm font-bold">{totalProgress}%</span>
            <span className="text-xs text-blue-100/80">progression globale</span>
          </div>
        </div>
      </div>

      <MimoCard text="Ici, le but n est pas de lire des slogans. Le guide doit vous aider à poser un meilleur cadre, repérer les bons critères et faire de meilleurs arbitrages dans le produit." />

      <div className="grid gap-4 md:grid-cols-3">
        {GUIDE_CATEGORIES.map((category) => {
          const categoryModules = GUIDE_MODULES.filter((moduleItem) => moduleItem.categoryId === category.id);
          const categoryAverage =
            categoryModules.length > 0
              ? Math.round(categoryModules.reduce((sum, moduleItem) => sum + (moduleProgress[moduleItem.id] ?? 0), 0) / categoryModules.length)
              : 0;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="premium-card rounded-[28px] p-5 text-left transition-all hover:translate-y-[-2px]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100 text-2xl">
                {category.icon}
              </div>
              <p className="mt-4 text-lg font-black text-slate-950">{category.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {GUIDE_MODULES.filter((item) => item.categoryId === category.id).length} modules · {GUIDE_QUIZZES.filter((item) => item.categoryId === category.id).length} quiz
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-blue-950">
                  {categoryAverage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/assistant" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
          <Bot className="h-5 w-5 text-blue-950" />
          <span className="text-sm font-semibold">Demander à Mimo</span>
        </Link>
        <Link href="/forum" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
          <MessageSquare className="h-5 w-5 text-blue-950" />
          <span className="text-sm font-semibold">Forum</span>
        </Link>
      </div>
    </div>
  );
}
