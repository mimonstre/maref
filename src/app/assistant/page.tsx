"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

type Message = {
  from: "mimo" | "user";
  text: string;
};

const SUGGESTIONS = [
  "Mes meilleurs choix actuels",
  "Comment fonctionne le score ?",
  "Que signifie PEFAS ?",
  "Aide-moi a comparer",
  "Conseils pour mon budget",
];

const MIMO_RESPONSES: Record<string, string> = {
  "mes meilleurs choix actuels": "D apres votre profil, je vous orienterais vers les offres avec un score superieur a 80. Explorez la categorie Electromenager ou Froid pour voir les meilleures offres du moment. Le Miele SilentWash 7kg et le Sony PureBlack 65 pouces sont actuellement tres bien positionnes.",
  "comment fonctionne le score ?": "Le Score MAREF evalue chaque offre sur 100 points en combinant 5 axes : Pertinence, Economie, Fluidite, Assurance et Stabilite. Ce n est pas une simple moyenne — chaque axe est pondere selon votre profil (budget, priorite, horizon). Un score de 85+ est excellent, 70-84 tres bon, 55-69 correct.",
  "que signifie pefas ?": "PEFAS est l acronyme des 5 axes d analyse MAREF :\n\nP = Pertinence (adequation a votre besoin)\nE = Economie (rapport cout total / valeur)\nF = Fluidite (facilite d acces, livraison)\nA = Assurance (fiabilite marchand, garantie)\nS = Stabilite (durabilite, constance prix)\n\nChaque axe est note sur 100 et influence le score global.",
  "aide-moi a comparer": "Pour comparer efficacement, allez dans la section Comparer. Recherchez 2 ou 3 offres qui vous interessent. Je vous montrerai les differences sur chaque axe PEFAS, le cout total etendu, et je vous dirai laquelle est la plus adaptee a votre profil.",
  "conseils pour mon budget": "Avec un budget modere, concentrez-vous sur les offres avec un bon score Economie (E). Ne regardez pas que le prix d achat — le cout total etendu inclut l usage sur plusieurs annees. Parfois, payer un peu plus a l achat reduit significativement le cout sur la duree.",
};

function getMimoResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(MIMO_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return response;
    }
  }
  if (lower.includes("score")) return MIMO_RESPONSES["comment fonctionne le score ?"];
  if (lower.includes("pefas") || lower.includes("axe")) return MIMO_RESPONSES["que signifie pefas ?"];
  if (lower.includes("compar")) return MIMO_RESPONSES["aide-moi a comparer"];
  if (lower.includes("budget") || lower.includes("prix")) return MIMO_RESPONSES["conseils pour mon budget"];
  if (lower.includes("meilleur") || lower.includes("recommand")) return MIMO_RESPONSES["mes meilleurs choix actuels"];
  if (lower.includes("bonjour") || lower.includes("salut") || lower.includes("hello")) return "Bonjour ! Je suis Mimo, votre assistant decisionnel MAREF. Comment puis-je vous aider ? Vous pouvez me poser des questions sur les scores, les axes PEFAS, ou me demander des conseils personnalises.";
  if (lower.includes("merci")) return "Avec plaisir ! N hesitez pas si vous avez d autres questions. Je suis la pour vous aider a prendre les meilleures decisions d achat.";
  return "Je comprends votre question. Pour vous aider au mieux, je vous suggere d explorer les offres disponibles dans l Explorer, ou de consulter le Guide pour mieux comprendre le fonctionnement de MAREF. Vous pouvez aussi me demander comment fonctionne le score, ce que signifie PEFAS, ou des conseils pour votre budget.";
}

export default function AssistantPage() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || "Utilisateur";
  const [messages, setMessages] = useState<Message[]>([
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
    }, 800 + Math.random() * 600);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.from === "user" ? "justify-end" : "justify-start")}>
            <div className={
              "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line " +
              (m.from === "user"
                ? "bg-emerald-700 text-white rounded-br-md"
                : "bg-gradient-to-br from-emerald-50 to-emerald-100 text-gray-800 rounded-bl-md border border-emerald-200")
            }>
              {m.from === "mimo" && (
                <span className="text-[0.6rem] font-bold text-emerald-700 block mb-1">Mimo</span>
              )}
              {m.text}
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

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <input
          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
          placeholder="Posez votre question a Mimo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}