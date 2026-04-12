"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ASSISTANT_SUGGESTIONS,
  getMimoResponse,
  type AssistantMessage,
  type MimoContext,
} from "@/features/assistant/content";
import { getProjectsWithOffers } from "@/features/projects/api";
import { getFavorites, getViewHistory } from "@/lib/queries";
import type { UserDecisionProfile } from "@/lib/core";
import { getRecentSearchSignals, getUserLocation } from "@/lib/core/userSignals";

export default function AssistantPage() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || "Utilisateur";

  const [context, setContext] = useState<MimoContext>({});
  const [contextLoaded, setContextLoaded] = useState(false);

  const buildGreeting = (ctx: MimoContext): string => {
    if (ctx.hasProjects && ctx.projects && ctx.projects.length > 0) {
      const count = ctx.projects.length;
      return (
        "Bonjour " +
        userName +
        ". Tu as " +
        count +
        " projet" +
        (count > 1 ? "s" : "") +
        " en cours. Je peux t aider a analyser tes offres, comprendre le score, ou te donner une recommandation contextualisee."
      );
    }
    return (
      "Bonjour " +
      userName +
      ". Je suis Mimo, ton assistant decisionnel MAREF. Pose-moi n importe quelle question sur les offres, le score PEFAS, ou tes projets d achat."
    );
  };

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        const [{ projects, projectOffers }, favIds, history] = await Promise.all([
          getProjectsWithOffers(),
          getFavorites(),
          getViewHistory(),
        ]);

        let profile: UserDecisionProfile | undefined;
        try {
          const raw = localStorage.getItem("maref_user_profile");
          if (raw) profile = JSON.parse(raw) as UserDecisionProfile;
        } catch {}

        let totalOffers = 0;
        const projectsSummary = projects.map((p) => {
          const offers = projectOffers[p.id] || [];
          totalOffers += offers.length;
          const validOffers = offers.filter((o) => o.score !== null);

const avgScore =
  validOffers.length > 0
    ? Math.round(
        validOffers.reduce((acc, o) => acc + (o.score ?? 0), 0) / validOffers.length
      )
    : 0;
          return {
            name: p.name,
            offers: offers.length,
            score: avgScore,
            category: p.category,
          };
        });

        const recentSearches = getRecentSearchSignals().slice(0, 4).map((item) => item.label);
        const location = getUserLocation();

        const ctx: MimoContext = {
          projects: projectsSummary,
          favCount: favIds.length,
          preferredBudget: profile?.budget,
          preferredPriority: profile?.priority,
          hasProjects: projects.length > 0,
          totalOffers,
          recentSearches,
          recentViews: history.slice(0, 4).map((item) => item.product),
          location: location ? [location.city, location.postalCode, location.region].filter(Boolean).join(" - ") : undefined,
        };

        setContext(ctx);
        setMessages([{ from: "mimo", text: buildGreeting(ctx), source: "local" }]);
      } catch {
        setMessages([
          {
            from: "mimo",
            text: "Bonjour " + userName + ". Je suis Mimo, ton assistant decisionnel MAREF. Comment puis-je t aider ?",
            source: "local",
          },
        ]);
      } finally {
        setContextLoaded(true);
      }
    }

    loadContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);

    let responseText: string;
    let source: "ai" | "local" = "local";

    // Try Claude API with 5 second timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const history = messages.map((m) => ({ from: m.from, text: m.text }));

      const res = await fetch("/api/mimo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json() as { text: string };
        responseText = data.text;
        source = "ai";
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fall back to local response
      responseText = getMimoResponse(msg, context);
      source = "local";
    }

    setMessages((prev) => [...prev, { from: "mimo", text: responseText, source }]);
    setTyping(false);
  }

  // Contextual suggestions based on loaded context
  const dynamicSuggestions: string[] = [];
  if (context.projects && context.projects.length > 0) {
    dynamicSuggestions.push("Analyse mon projet " + context.projects[0].name);
  }
  if (context.favCount && context.favCount > 0) {
    dynamicSuggestions.push("Mes offres favorites");
  }
  if (context.recentSearches && context.recentSearches.length > 0) {
    dynamicSuggestions.push("Que penses-tu de mes dernieres recherches ?");
  }
  dynamicSuggestions.push("Quelle est la meilleure offre pour moi ?");

  const allSuggestions = [...ASSISTANT_SUGGESTIONS, ...dynamicSuggestions];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {!contextLoaded && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={"flex " + (message.from === "user" ? "justify-end" : "justify-start")}>
            <div
              className={
                "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line " +
                (message.from === "user"
                  ? "bg-blue-950 text-white rounded-br-md"
                  : "rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800")
              }
            >
              {message.from === "mimo" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[0.6rem] font-bold text-blue-950">Mimo</span>
                  {message.source === "ai" && (
                    <span className="text-[0.55rem] px-1 py-0.5 rounded bg-blue-950 text-white font-semibold leading-none">IA</span>
                  )}
                  {message.source === "local" && (
                    <span className="text-[0.55rem] px-1 py-0.5 rounded bg-gray-200 text-gray-500 font-semibold leading-none">Local</span>
                  )}
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
                <span className="h-2 w-2 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {messages.length <= 2 && contextLoaded && (
        <div className="flex gap-2 flex-wrap pb-3">
          {allSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-slate-300 hover:text-blue-950"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <input
          className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-950 focus:ring-2 focus:ring-slate-200"
          placeholder="Posez votre question a Mimo..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || typing}
          className="rounded-xl bg-blue-950 px-4 py-2.5 text-white transition-colors hover:bg-slate-950 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
