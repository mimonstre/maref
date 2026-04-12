"use client";

import Link from "next/link";
import { BookOpen, Bot, Check, MessageSquare, PencilLine } from "lucide-react";
import { useState } from "react";
import { GUIDE_MODULES, GUIDE_QUIZZES } from "@/features/guide/content";

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

  const activeGuideModule = GUIDE_MODULES.find((moduleItem) => moduleItem.id === activeModule);
  const quiz = GUIDE_QUIZZES.find((quizItem) => quizItem.id === activeQuiz);

  if (quiz) {
    if (quizStep >= quiz.questions.length) {
      const correct = quizAnswers.filter((answer, index) => answer === quiz.questions[index].correct).length;
      const pct = Math.round((correct / quiz.questions.length) * 100);
      const passed = pct >= 60;

      return (
        <div className="space-y-5">
          <button
            onClick={() => {
              if (passed && !completedQuizzes.has(quiz.id)) saveQuizCompleted(quiz.id);
              setActiveQuiz(null);
              setQuizStep(0);
              setQuizAnswers([]);
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour
          </button>

          <div className="text-center py-6">
            <div className="flex justify-center mb-3 text-blue-700">
              {pct >= 80 ? <Check className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
            </div>
            <h2 className="text-2xl font-bold">{correct} / {quiz.questions.length}</h2>
            <p className="text-sm text-gray-500 mt-2">
              {pct >= 80 ? "Excellent, vous maitrisez bien le sujet." : pct >= 60 ? "Bonne base, mais quelques points restent a revoir." : "Continuez le guide puis retentez le quiz."}
            </p>
            {passed && (
            <span className="inline-block mt-3 text-[0.7rem] font-semibold text-blue-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                Quiz valide
              </span>
            )}
          </div>

          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="absolute -top-2.5 left-4 bg-blue-900 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
            <p className="text-sm text-gray-800 mt-2">
              {pct >= 80 ? "Bravo. Vous pouvez passer au module suivant ou appliquer ces notions dans vos projets." : "Revenez sur le module correspondant, puis refaites le quiz a froid."}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="flex-1 bg-blue-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-950 transition-colors text-sm"
            >
              Recommencer
            </button>
            <button
              onClick={() => {
                if (passed && !completedQuizzes.has(quiz.id)) saveQuizCompleted(quiz.id);
                setActiveQuiz(null);
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="flex-1 bg-white border border-gray-200 font-semibold py-2.5 rounded-xl hover:border-blue-300 transition-colors text-sm"
            >
              Retour au guide
            </button>
          </div>
        </div>
      );
    }

    const question = quiz.questions[quizStep];

    return (
      <div className="space-y-5">
        <button
          onClick={() => {
            setActiveQuiz(null);
            setQuizStep(0);
            setQuizAnswers([]);
          }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Quitter le quiz
        </button>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Question {quizStep + 1} / {quiz.questions.length}</span>
          <span className="text-xs font-semibold text-blue-900">{quiz.title}</span>
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-900 rounded-full transition-all" style={{ width: `${(quizStep / quiz.questions.length) * 100}%` }}></div>
        </div>

        <h3 className="font-bold text-lg">{question.q}</h3>
        <div className="space-y-2.5">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                setQuizAnswers([...quizAnswers, index]);
                setQuizStep(quizStep + 1);
              }}
              className="w-full text-left flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeGuideModule) {
    const currentProgress = moduleProgress[activeGuideModule.id] ?? 0;
    const totalLessons = activeGuideModule.content.length;

    return (
      <div className="space-y-5">
        <button onClick={() => setActiveModule(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour au guide
        </button>

        <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-3xl mb-3">{activeGuideModule.icon}</p>
          <h2 className="text-xl font-bold">{activeGuideModule.title}</h2>
          <p className="text-blue-200 text-sm mt-1">{activeGuideModule.desc}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{activeGuideModule.difficulty}</span>
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{activeGuideModule.duration}</span>
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{activeGuideModule.lessons} lecons</span>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${currentProgress}%` }}></div>
          </div>
          <p className="text-[0.7rem] text-blue-200 mt-1">{currentProgress}% complete</p>
        </div>

        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="absolute -top-2.5 left-4 bg-blue-900 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
          <p className="text-sm text-gray-800 mt-2">Ce module vous aide a comprendre un aspect cle du produit. Chaque lecon est courte, concrete et directement applicable.</p>
        </div>

        <div className="space-y-3">
          {activeGuideModule.content.map((lesson, index) => {
            const lessonProgressThreshold = Math.round(((index + 1) / totalLessons) * 100);
            const completed = currentProgress >= lessonProgressThreshold;

            return (
              <div key={index} className={"bg-white rounded-xl border p-4 " + (completed ? "border-blue-200" : "border-gray-200")}>
                <div className="flex items-start gap-3">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 " + (completed ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400")}>
                    {completed ? "OK" : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">Lecon {index + 1}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{lesson}</p>
                    {!completed && (
                      <button
                        onClick={() => markLessonComplete(activeGuideModule.id, index, totalLessons)}
                        className="mt-2 text-xs font-semibold text-blue-900 border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg transition-colors"
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

  const totalProgress =
    GUIDE_MODULES.length > 0
      ? Math.round(GUIDE_MODULES.reduce((sum, moduleItem) => sum + (moduleProgress[moduleItem.id] ?? 0), 0) / GUIDE_MODULES.length)
      : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Guide MAREF</h2>
        <p className="text-sm text-gray-500 mt-1">Apprenez a mieux decider. Chaque module vous rend plus autonome.</p>
      </div>

      <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Votre progression</span>
          <span className="text-2xl font-extrabold">{totalProgress}%</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${totalProgress}%` }}></div>
        </div>
        <p className="text-[0.7rem] text-blue-200 mt-2">
          {GUIDE_MODULES.filter((moduleItem) => (moduleProgress[moduleItem.id] ?? 0) === 100).length} / {GUIDE_MODULES.length} modules termines
        </p>
      </div>

      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-blue-900 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">Le guide est votre allie pour comprendre comment MAREF fonctionne. Commencez par les modules en cours puis validez vos acquis avec les quiz.</p>
      </div>

      <div>
        <h3 className="font-bold mb-3">Modules</h3>
        <div className="space-y-2.5">
          {GUIDE_MODULES.map((moduleItem) => {
            const progress = moduleProgress[moduleItem.id] ?? 0;
            return (
              <div
                key={moduleItem.id}
                onClick={() => setActiveModule(moduleItem.id)}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3.5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{moduleItem.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{moduleItem.title}</h4>
                    {progress > 0 && progress < 100 && (
                      <span className="text-[0.65rem] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">En cours</span>
                    )}
                    {progress === 100 && (
                      <span className="text-[0.65rem] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Termine</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{moduleItem.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[0.65rem] text-gray-400 shrink-0">{progress}%</span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[0.65rem] text-gray-400">{moduleItem.difficulty}</span>
                    <span className="text-[0.65rem] text-gray-400">-</span>
                    <span className="text-[0.65rem] text-gray-400">{moduleItem.duration}</span>
                    <span className="text-[0.65rem] text-gray-400">-</span>
                    <span className="text-[0.65rem] text-gray-400">{moduleItem.lessons} lecons</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Quiz</h3>
        <div className="space-y-2.5">
          {GUIDE_QUIZZES.map((quizItem) => (
            <div
              key={quizItem.id}
              onClick={() => {
                setActiveQuiz(quizItem.id);
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 shrink-0">
                <PencilLine className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{quizItem.title}</h4>
                <p className="text-xs text-gray-500">{quizItem.questions.length} questions</p>
              </div>
              {completedQuizzes.has(quizItem.id) && (
                <span className="text-[0.65rem] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">Valide</span>
              )}
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/assistant" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-700" />
          <span className="text-sm font-semibold">Demander a Mimo</span>
        </Link>
        <Link href="/forum" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-700" />
          <span className="text-sm font-semibold">Forum</span>
        </Link>
      </div>
    </div>
  );
}
