"use client";

import Link from "next/link";
import { useState } from "react";
import { GUIDE_MODULES, GUIDE_QUIZZES } from "@/features/guide/content";

export default function GuidePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const activeGuideModule = GUIDE_MODULES.find((moduleItem) => moduleItem.id === activeModule);
  const quiz = GUIDE_QUIZZES.find((quizItem) => quizItem.id === activeQuiz);

  if (quiz) {
    if (quizStep >= quiz.questions.length) {
      const correct = quizAnswers.filter((answer, index) => answer === quiz.questions[index].correct).length;
      const pct = Math.round((correct / quiz.questions.length) * 100);

      return (
        <div className="space-y-5">
          <button
            onClick={() => {
              setActiveQuiz(null);
              setQuizStep(0);
              setQuizAnswers([]);
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour
          </button>
          <div className="text-center py-6">
            <p className="text-4xl mb-3">{pct >= 80 ? "ðŸ†" : pct >= 50 ? "ðŸ‘" : "ðŸ“š"}</p>
            <h2 className="text-2xl font-bold">{correct} / {quiz.questions.length}</h2>
            <p className="text-sm text-gray-500 mt-2">
              {pct >= 80 ? "Excellent ! Vous maitrisez le sujet." : pct >= 50 ? "Pas mal ! Quelques points a revoir." : "Continuez la formation pour progresser."}
            </p>
          </div>
          <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
            <p className="text-sm text-gray-800 mt-2">{pct >= 80 ? "Bravo, votre comprehension du systeme est solide." : "Je vous recommande de revoir les modules lies avant de retenter."}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="flex-1 bg-emerald-700 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-800 transition-colors text-sm"
            >
              Recommencer
            </button>
            <button
              onClick={() => {
                setActiveQuiz(null);
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="flex-1 bg-white border border-gray-200 font-semibold py-2.5 rounded-xl hover:border-emerald-300 transition-colors text-sm"
            >
              Retour au Guide
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
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
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
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                setQuizAnswers([...quizAnswers, index]);
                setQuizStep(quizStep + 1);
              }}
              className="w-full text-left flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all"
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
    return (
      <div className="space-y-5">
        <button onClick={() => setActiveModule(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour au Guide
        </button>

        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-3xl mb-3">{activeGuideModule.icon}</p>
          <h2 className="text-xl font-bold">{activeGuideModule.title}</h2>
          <p className="text-emerald-200 text-sm mt-1">{activeGuideModule.desc}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{activeGuideModule.difficulty}</span>
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{activeGuideModule.duration}</span>
            <span className="text-[0.7rem] bg-white/15 px-2 py-0.5 rounded-md">{activeGuideModule.lessons} lecons</span>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: activeGuideModule.progress + "%" }}></div>
          </div>
          <p className="text-[0.7rem] text-emerald-200 mt-1">{activeGuideModule.progress}% complete</p>
        </div>

        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
          <p className="text-sm text-gray-800 mt-2">Ce module vous aide a comprendre un aspect cle du produit. Prenez le temps de lire chaque section : elles sont courtes et ciblees.</p>
        </div>

        <div className="space-y-3">
          {activeGuideModule.content.map((lesson, index) => {
            const completed = index < Math.ceil(activeGuideModule.lessons * activeGuideModule.progress / 100);

            return (
              <div key={index} className={"bg-white rounded-xl border p-4 " + (completed ? "border-emerald-200" : "border-gray-200")}>
                <div className="flex items-start gap-3">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 " + (completed ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-400")}>
                    {completed ? "âœ“" : index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Lecon {index + 1}</h4>
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

  const totalProgress = Math.round(GUIDE_MODULES.reduce((sum, moduleItem) => sum + moduleItem.progress, 0) / GUIDE_MODULES.length);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Guide MAREF</h2>
        <p className="text-sm text-gray-500 mt-1">Apprenez a mieux decider. Chaque module vous rend plus autonome.</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Votre progression</span>
          <span className="text-2xl font-extrabold">{totalProgress}%</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: totalProgress + "%" }}></div>
        </div>
        <p className="text-[0.7rem] text-emerald-200 mt-2">{GUIDE_MODULES.filter((moduleItem) => moduleItem.progress === 100).length} / {GUIDE_MODULES.length} modules termines</p>
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">Le Guide est votre allie pour comprendre comment MAREF fonctionne. Commencez par les modules en cours : chaque lecon est courte et actionnable.</p>
      </div>

      <div>
        <h3 className="font-bold mb-3">Modules</h3>
        <div className="space-y-2.5">
          {GUIDE_MODULES.map((moduleItem) => (
            <div
              key={moduleItem.id}
              onClick={() => setActiveModule(moduleItem.id)}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3.5 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{moduleItem.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{moduleItem.title}</h4>
                  {moduleItem.progress > 0 && moduleItem.progress < 100 && (
                    <span className="text-[0.65rem] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">En cours</span>
                  )}
                  {moduleItem.progress === 100 && (
                    <span className="text-[0.65rem] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Termine</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{moduleItem.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: moduleItem.progress + "%" }}></div>
                  </div>
                  <span className="text-[0.65rem] text-gray-400 shrink-0">{moduleItem.progress}%</span>
                </div>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[0.65rem] text-gray-400">{moduleItem.difficulty}</span>
                  <span className="text-[0.65rem] text-gray-400">Â·</span>
                  <span className="text-[0.65rem] text-gray-400">{moduleItem.duration}</span>
                  <span className="text-[0.65rem] text-gray-400">Â·</span>
                  <span className="text-[0.65rem] text-gray-400">{moduleItem.lessons} lecons</span>
                </div>
              </div>
            </div>
          ))}
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
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg shrink-0">ðŸ“</div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{quizItem.title}</h4>
                <p className="text-xs text-gray-500">{quizItem.questions.length} questions</p>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/assistant" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">ðŸ¤–</span>
          <span className="text-sm font-semibold">Demander a Mimo</span>
        </Link>
        <Link href="/forum" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">ðŸ’¬</span>
          <span className="text-sm font-semibold">Forum</span>
        </Link>
      </div>
    </div>
  );
}
