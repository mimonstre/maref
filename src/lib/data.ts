export const CATEGORIES = [
  {
    id: "electromenager", name: "Electromenager", icon: "🏠",
    count: 18,
    subs: [
      { id: "lavage", name: "Lavage", icon: "🫧", count: 10 },
      { id: "vaisselle", name: "Vaisselle", icon: "🍽", count: 8 },
    ],
  },
  {
    id: "froid", name: "Froid", icon: "❄️",
    count: 14,
    subs: [
      { id: "refrigerateurs", name: "Refrigerateurs", icon: "🧊", count: 6 },
      { id: "congelation", name: "Congelation", icon: "🥶", count: 4 },
      { id: "multidoor", name: "Multidoor / americain", icon: "🚪", count: 4 },
    ],
  },
  {
    id: "televiseurs", name: "Televiseurs", icon: "📺",
    count: 12,
    subs: [
      { id: "technologie", name: "Technologie", icon: "💡", count: 5 },
      { id: "taille", name: "Taille", icon: "📐", count: 4 },
      { id: "usage-tv", name: "Usage", icon: "🎮", count: 3 },
    ],
  },
];

export type Offer = {
  id: string;
  product: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  merchant: string;
  price: number;
  barredPrice: number | null;
  availability: string;
  delivery: string;
  warranty: string;
  score: number;
  status: string;
  statusColor: string;
  confidence: string;
  freshness: string;
  pefas: { P: number; E: number; F: number; A: number; S: number };
  mimoShort: string;
  reasons: string[];
  vigilances: string[];
  specs: Record<string, string>;
};