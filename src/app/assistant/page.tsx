"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ASSISTANT_SUGGESTIONS,
  getMimoResponse,
  type AssistantMessage,
  type MimoContext,
} from "@/features/assistant/content";
import { getProjectsWithOffers } from "@/features/projects/api";
import { getRecentSearchSignals, getUserLocation } from "@/lib/core/userSignals";
import { appendPersistedMimoExchange, loadPersistedMimoMessages } from "@/lib/services/accountMemory";
import { getFavorites, getUserProfile, getViewHistory } from "@/lib/queries";

export default function AssistantPage() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || "Utilisateur";
  const [context, setContext] = useState<MimoContext>({});
  const [contextLoaded, setContextLoaded] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const dynamicSuggestions = useMemo(() => {
    const suggestions = [...ASSISTANT_SUGGESTIONS];
    if (context.projects?.length) suggestions.unshift(`Que penses-tu de mon projet ${context.projects[0].name} ?`);
    if (context.recentSearches?.length) suggestions.push("Que déduis-tu de mes dernières recherches ?");
    if (context.recentViews?.length) suggestions.push("Que peux-tu me dire sur mes dernières fiches vues ?");
    return suggestions.slice(0, 8);
  }, [context]);

  useEffect(() => {
    async function loadContext() {
      try {
        const [{ projects, projectOffers }, favoriteIds, history, profile] = await Promise.all([
          getProjectsWithOffers(),
          getFavorites(),
          getViewHistory(),
          getUserProfile(),
        ]);

        const projectsSummary = projects.map((project) => {
          const offers = projectOffers[project.id] || [];
          const validOffers = offers.filter((offer) => offer.score !== null);
          const avgScore =
            validOffers.length > 0
              ? Math.round(validOffers.reduce((sum, offer) => sum + (offer.score ?? 0), 0) / validOffers.length)
              : 0;

          return {
            id: project.id,
            name: project.name,
            offers: offers.length,
            score: avgScore,
            category: project.category,
          };
        });

        const prioritizedProject = projectsSummary[0];
        const recentSearches = getRecentSearchSignals().slice(0, 5).map((item) => item.label);
        const location = getUserLocation();
        const nextActiveProjectId = prioritizedProject?.id || null;

        const nextContext: MimoContext = {
          projects: projectsSummary.map((project) => ({
            name: project.name,
            offers: project.offers,
            score: project.score,
            category: project.category,
          })),
          favCount: favoriteIds.length,
          preferredBudget: profile?.budget,
          preferredPriority: profile?.priority,
          decisionStyle: profile?.horizon,
          household: profile?.usage,
          housingType: profile?.risk,
          supportStyle: profile?.priority,
          hasProjects: projects.length > 0,
          totalOffers: projectsSummary.reduce((sum, item) => sum + item.offers, 0),
          recentSearches,
          recentViews: history.slice(0, 5).map((item) => item.product),
          location: location
            ? [location.city, location.postalCode, location.region].filter(Boolean).join(" • ")
            : undefined,
        };

        const persistedMessages = await loadPersistedMimoMessages(nextActiveProjectId);
        const hydratedMessages: AssistantMessage[] = persistedMessages.map((message) => ({
          from: message.role === "assistant" ? "mimo" : "user",
          text: message.text,
          source: message.role === "assistant" ? message.source || "local" : undefined,
        }));

        setActiveProjectId(nextActiveProjectId);
        setContext(nextContext);
        setMessages(
          hydratedMessages.length > 0
            ? hydratedMessages
            : [
                {
                  from: "mimo",
                  text:
                    nextContext.projects && nextContext.projects.length > 0
                      ? `Bonjour ${userName}. Je vois vos projets, vos recherches récentes et votre profil de décision. Dites-moi ce que vous essayez de trancher et je vous aide à poser une réponse utile.`
                      : `Bonjour ${userName}. Je suis Mimo, l’assistant décisionnel de MAREF. On peut partir d’un besoin, d’un doute, d’une offre, d’une comparaison ou d’une question libre.`,
                  source: "local",
                },
              ],
        );
      } catch {
        setMessages([
          {
            from: "mimo",
            text: `Bonjour ${userName}. Je suis Mimo. Dites-moi ce que vous voulez comprendre, comparer ou cadrer.`,
            source: "local",
          },
        ]);
      } finally {
        setContextLoaded(true);
      }
    }

    void loadContext();
  }, [userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage(text?: string) {
    const nextText = text || input.trim();
    if (!nextText) return;

    const history = messages.map((message) => ({ from: message.from, text: message.text }));
    setMessages((previous) => [...previous, { from: "user", text: nextText }]);
    setInput("");
    setTyping(true);

    let responseText = "";
    let source: "ai" | "local" = "local";

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      const response = await fetch("/api/mimo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: nextText, context, history, projectId: activeProjectId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = (await response.json()) as { text: string };
      responseText = data.text;
      source = "ai";
    } catch {
      responseText = getMimoResponse(nextText, context);
      source = "local";
    }

    setMessages((previous) => [...previous, { from: "mimo", text: responseText, source }]);
    setTyping(false);
    void appendPersistedMimoExchange({
      projectId: activeProjectId,
      userText: nextText,
      assistantText: responseText,
      source,
    });
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <div className="premium-surface mb-3 rounded-[28px] p-4">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Assistant Mimo</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Une IA reliée à votre contexte MAREF</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Mimo lit vos projets, vos dernières recherches, vos consultations récentes et vos préférences pour répondre
          de manière plus juste.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {!contextLoaded && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-900" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-900" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-900" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={"flex " + (message.from === "user" ? "justify-end" : "justify-start")}>
            <div
              className={
                "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm " +
                (message.from === "user"
                  ? "rounded-br-md bg-blue-950 text-white"
                  : "rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800")
              }
            >
              {message.from === "mimo" && (
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-[0.6rem] font-bold text-blue-950">Mimo</span>
                  <span
                    className={
                      "rounded px-1 py-0.5 text-[0.55rem] font-semibold leading-none " +
                      (message.source === "ai" ? "bg-blue-950 text-white" : "bg-slate-200 text-slate-600")
                    }
                  >
                    {message.source === "ai" ? "IA" : "Local"}
                  </span>
                </div>
              )}
              {message.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-900" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-900" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-900" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {messages.length <= 2 && contextLoaded && (
        <div className="flex flex-wrap gap-2 pb-3">
          {dynamicSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => void sendMessage(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:text-blue-950"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-slate-200 pt-3">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-950 focus:ring-2 focus:ring-slate-200"
          placeholder="Posez votre question à Mimo..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void sendMessage();
          }}
        />
        <button
          onClick={() => void sendMessage()}
          disabled={!input.trim() || typing}
          className="rounded-xl bg-blue-950 px-4 py-2.5 text-white transition-colors hover:bg-slate-950 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
