"use client";
import { useState } from "react";

const FORUM_TOPICS = [
  {
    id: "t1",
    title: "Lave-linge frontal vs top : retour d experience ?",
    author: "Sophie M.",
    authorColor: "bg-indigo-500",
    badge: "Contributeur",
    replies: 14,
    views: 203,
    category: "Electromenager",
    time: "Il y a 3h",
    content: "Je dois remplacer mon lave-linge et j hesite entre un frontal et un top. Mon espace est limite (60cm). Des retours ?",
    replyList: [
      { author: "Thomas R.", authorColor: "bg-orange-500", badge: "Expert", text: "Le top est plus adapte aux petits espaces mais les frontaux ont progresse en termes de compacite. Regardez les modeles slim.", time: "Il y a 2h", votes: 5 },
      { author: "Nadia K.", authorColor: "bg-emerald-500", badge: "Analyste", text: "J ai eu les deux. Le frontal est plus silencieux et permet de poser des choses dessus. Le top se charge plus facilement.", time: "Il y a 1h", votes: 3 },
    ],
  },
  {
    id: "t2",
    title: "OLED vs QLED pour un salon lumineux ?",
    author: "Marc D.",
    authorColor: "bg-emerald-700",
    badge: "Analyste",
    replies: 8,
    views: 156,
    category: "Televiseurs",
    time: "Il y a 6h",
    content: "Mon salon est tres lumineux (grandes baies vitrees). L OLED est-il vraiment superieur au QLED dans ce contexte ?",
    replyList: [
      { author: "Julie P.", authorColor: "bg-indigo-500", badge: "Contributeur", text: "Dans un salon lumineux, le QLED a un avantage net en termes de luminosite. L OLED excelle dans l obscurite.", time: "Il y a 4h", votes: 7 },
    ],
  },
  {
    id: "t3",
    title: "Refrigerateur americain : vraiment utile pour 2 personnes ?",
    author: "Claire B.",
    authorColor: "bg-yellow-500",
    badge: "Membre",
    replies: 6,
    views: 89,
    category: "Froid",
    time: "Il y a 1j",
    content: "On est deux et on hesite a prendre un americain pour le confort. Mais est-ce justifie en consommation ?",
    replyList: [],
  },
  {
    id: "t4",
    title: "Fiabilite Beko vs Bosch sur les lave-vaisselle",
    author: "Ahmed L.",
    authorColor: "bg-blue-500",
    badge: "Expert",
    replies: 11,
    views: 178,
    category: "Electromenager",
    time: "Il y a 2j",
    content: "Grosse difference de prix entre Beko et Bosch. La fiabilite justifie-t-elle l ecart ?",
    replyList: [
      { author: "Marie C.", authorColor: "bg-pink-500", badge: "Contributeur", text: "Bosch a un SAV bien meilleur et une duree de vie superieure en moyenne. L ecart de prix se justifie sur 5+ ans.", time: "Il y a 1j", votes: 4 },
      { author: "Karim S.", authorColor: "bg-emerald-600", badge: "Analyste", text: "Beko a fait des progres mais sur les lave-vaisselle, Bosch reste la reference. Regardez le score Stabilite sur MAREF.", time: "Il y a 1j", votes: 6 },
    ],
  },
];

export default function ForumPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recent");

  const topic = FORUM_TOPICS.find((t) => t.id === activeTopic);

  // Topic detail view
  if (topic) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveTopic(null)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          Retour au forum
        </button>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + topic.authorColor}>
              {topic.author[0]}
            </div>
            <div>
              <span className="font-semibold text-sm">{topic.author}</span>
              <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1.5">{topic.badge}</span>
              <p className="text-xs text-gray-400">{topic.time}</p>
            </div>
          </div>
          <h2 className="text-lg font-bold">{topic.title}</h2>
          <p className="text-sm text-gray-600 mt-2">{topic.content}</p>
          <div className="flex gap-3 mt-3">
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{topic.category}</span>
            <span className="text-xs text-gray-400">{topic.replies} reponses · {topic.views} vues</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Reponses ({topic.replyList.length})</h3>
          {topic.replyList.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune reponse pour le moment. Soyez le premier !</p>
          ) : (
            <div className="space-y-3">
              {topic.replyList.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={"w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold " + r.authorColor}>
                      {r.author[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-xs">{r.author}</span>
                      <span className="text-[0.65rem] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1">{r.badge}</span>
                      <span className="text-[0.65rem] text-gray-400 ml-1.5">{r.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{r.text}</p>
                  <div className="mt-2">
                    <span className="text-xs text-emerald-600 font-medium cursor-pointer hover:text-emerald-800">▲ {r.votes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-bold text-sm mb-2">Repondre</h4>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 resize-none"
            rows={3}
            placeholder="Votre reponse..."
          ></textarea>
          <button className="mt-2 text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
            Publier
          </button>
        </div>
      </div>
    );
  }

  // Forum list view
  const filtered = activeTab === "recent"
    ? FORUM_TOPICS
    : FORUM_TOPICS.filter((t) => t.category.toLowerCase().includes(activeTab));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Forum</h2>
        <p className="text-sm text-gray-500 mt-1">Echangez avec la communaute MAREF.</p>
      </div>

      <div className="flex gap-0 border-b-2 border-gray-100 overflow-x-auto">
        {[
          { id: "recent", label: "Recent" },
          { id: "electromenager", label: "Electromenager" },
          { id: "froid", label: "Froid" },
          { id: "televiseurs", label: "TV" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={
              "px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-colors " +
              (activeTab === tab.id
                ? "text-emerald-700 border-emerald-700"
                : "text-gray-400 border-transparent hover:text-gray-600")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => setActiveTopic(t.id)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + t.authorColor}>
                  {t.author[0]}
                </div>
                <div>
                  <span className="font-semibold text-xs">{t.author}</span>
                  <span className="text-[0.65rem] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1.5">{t.badge}</span>
                </div>
              </div>
              <span className="text-[0.65rem] text-gray-400">{t.time}</span>
            </div>
            <h4 className="font-bold text-sm">{t.title}</h4>
            <div className="flex gap-3 mt-1.5">
              <span className="text-[0.7rem] text-gray-400">{t.replies} reponses</span>
              <span className="text-[0.7rem] text-gray-400">{t.views} vues</span>
              <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{t.category}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">
          Le forum vous permet d echanger avec d autres decideurs avertis. Partagez vos retours d experience et beneficiez des conseils de la communaute.
        </p>
      </div>
    </div>
  );
}