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
import { getFavorites } from "@/lib/queries";
import type { UserDecisionProfile } from "@/lib/core";

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
        const [{ projects, projectOffers }, favIds] = await Promise.all([
          getProjectsWithOffers(),
          getFavorites(),
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
          const avgScore =
            offers.length > 0
              ? Math.round(offers.reduce((acc, o) => acc + o.score, 0) / offers.length)
              : 0;
          return {
            name: p.name,
            offers: offers.length,
            score: avgScore,
            category: p.category,
          };
        });

        const ctx: MimoContext = {
          projects: projectsSummary,
          favCount: favIds.length,
          preferredBudget: profile?.budget,
          preferredPriority: profile?.priority,
          hasProjects: projects.length > 0,
          totalOffers,
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
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
    dynamicSuggestions.push("Mes offres sauvegardees");
  }
  dynamicSuggestions.push("Quelle est la meilleure offre ?");

  const allSuggestions = [...ASSISTANT_SUGGESTIONS, ...dynamicSuggestions];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {!contextLoaded && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
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
                  ? "bg-blue-700 text-white rounded-br-md"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 rounded-bl-md border border-blue-200")
              }
            >
              {message.from === "mimo" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[0.6rem] font-bold text-blue-700">Mimo</span>
                  {message.source === "ai" && (
                    <span className="text-[0.55rem] px-1 py-0.5 rounded bg-blue-600 text-white font-semibold leading-none">IA</span>
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
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
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <input
          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
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
          className="bg-blue-700 text-white px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50"
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
