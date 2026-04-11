"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ASSISTANT_SUGGESTIONS,
  getMimoResponse,
  type AssistantMessage,
} from "@/features/assistant/content";

export default function AssistantPage() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || "Utilisateur";
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { from: "mimo", text: "Bonjour " + userName + ". Je suis Mimo, votre assistant decisionnel. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getMimoResponse(msg);
      setMessages((prev) => [...prev, { from: "mimo", text: response }]);
      setTyping(false);
    }, 1000);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((message, index) => (
          <div key={index} className={"flex " + (message.from === "user" ? "justify-end" : "justify-start")}>
            <div
              className={
                "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line " +
                (message.from === "user"
                  ? "bg-emerald-700 text-white rounded-br-md"
                  : "bg-gradient-to-br from-emerald-50 to-emerald-100 text-gray-800 rounded-bl-md border border-emerald-200")
              }
            >
              {message.from === "mimo" && (
                <span className="text-[0.6rem] font-bold text-emerald-700 block mb-1">Mimo</span>
              )}
              {message.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap pb-3">
          {ASSISTANT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <input
          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
          placeholder="Posez votre question a Mimo..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50"
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
