export const CATEGORIES = [
  {
    id: "electromenager",
    name: "Electromenager",
    icon: "🏠",
    count: 18,
    subs: [
      { id: "lavage", name: "Lavage", icon: "🫧", count: 10 },
      { id: "vaisselle", name: "Vaisselle", icon: "🍽", count: 8 },
    ],
  },
  {
    id: "froid",
    name: "Froid",
    icon: "❄️",
    count: 14,
    subs: [
      { id: "refrigerateurs", name: "Refrigerateurs", icon: "🧊", count: 6 },
      { id: "congelation", name: "Congelation", icon: "🥶", count: 4 },
      { id: "multidoor", name: "Multidoor / americain", icon: "🚪", count: 4 },
    ],
  },
  {
    id: "televiseurs",
    name: "Televiseurs",
    icon: "📺",
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
};

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getStatus(score: number) {
  if (score >= 85) return { label: "Excellent choix", color: "#1a6b4e" };
  if (score >= 72) return { label: "Tres bon choix", color: "#2e8b57" };
  if (score >= 58) return { label: "Bon choix", color: "#6aab2e" };
  if (score >= 42) return { label: "A surveiller", color: "#e6a817" };
  if (score >= 25) return { label: "Risque", color: "#d4652a" };
  return { label: "Peu pertinent", color: "#c0392b" };
}

const MERCHANTS = ["Darty", "Boulanger", "Fnac", "Cdiscount", "Amazon", "BUT"];
const BRANDS = [
  "Samsung",
  "Bosch",
  "LG",
  "Whirlpool",
  "Miele",
  "Siemens",
  "Beko",
  "Sony",
  "TCL",
  "Hisense",
];
const MIMO_SHORTS = [
  "Offre solide, bien positionnee pour votre profil.",
  "Bon rapport qualite-prix-fiabilite dans votre contexte.",
  "Quelques points a verifier avant de decider.",
  "Offre correcte, des alternatives existent.",
  "Attention, plusieurs signaux meritent votre vigilance.",
];
const REASONS = [
  "Prix competitif",
  "Marque fiable",
  "Bonne efficacite energetique",
  "Livraison gratuite",
  "Garantie etendue",
  "Excellents retours",
  "Faible cout d usage",
];
const VIGILANCES = [
  "Cout d usage a verifier",
  "Fiabilite a confirmer",
  "Prix au-dessus de la moyenne",
  "Livraison payante",
  "Garantie limitee",
  "Peu de retours disponibles",
];

const templates: {
  cat: string;
  sub: string;
  names: string[];
  range: [number, number];
}[] = [
  {
    cat: "electromenager",
    sub: "lavage",
    names: [
      "ProWash 9kg",
      "EcoClean 8kg",
      "TurboSpin 10kg",
      "SilentWash 7kg",
      "MaxDrum 9kg",
    ],
    range: [349, 899],
  },
  {
    cat: "electromenager",
    sub: "vaisselle",
    names: ["CleanForce 60", "AquaWash Pro", "SilentDish 14c", "EcoPower 60"],
    range: [349, 799],
  },
  {
    cat: "froid",
    sub: "refrigerateurs",
    names: ["FreshCombi 340L", "CoolDuo Pro", "NatureFrost 360L", "BioFresh Combi"],
    range: [399, 1099],
  },
  {
    cat: "froid",
    sub: "multidoor",
    names: ["AmericaFrost 520L", "DoubleDoor XL", "IceMaker 580L"],
    range: [799, 1899],
  },
  {
    cat: "froid",
    sub: "congelation",
    names: ["FrostArmoire 220L", "DeepFreeze Pro", "ArcticStore 260L"],
    range: [349, 799],
  },
  {
    cat: "televiseurs",
    sub: "technologie",
    names: [
      "OLED Vision 55 pouces",
      "PureBlack 65 pouces",
      "QLED Bright 55 pouces",
      "LED Essential 43 pouces",
      "SmartLED 50 pouces",
    ],
    range: [199, 2499],
  },
  {
    cat: "televiseurs",
    sub: "taille",
    names: ["Grand Format 75 pouces", "Standard 55 pouces", "Compact 32 pouces"],
    range: [199, 1599],
  },
  {
    cat: "televiseurs",
    sub: "usage-tv",
    names: ["GameView 144Hz", "CinemaHome 65 pouces"],
    range: [599, 1599],
  },
];

export const OFFERS: Offer[] = [];
templates.forEach((t) => {
  t.names.forEach((name) => {
    const score = rand(28, 96);
    const st = getStatus(score);
    const price = rand(t.range[0], t.range[1]);
    OFFERS.push({
      id: "o" + Math.random().toString(36).substr(2, 9),
      product: name,
      brand: pick(BRANDS),
      model: pick(BRANDS).substring(0, 2).toUpperCase() + "-" + rand(1000, 9999),
      category: t.cat,
      subcategory: t.sub,
      merchant: pick(MERCHANTS),
      price: price,
      barredPrice: Math.random() > 0.6 ? price + rand(30, 200) : null,
      availability: pick(["En stock", "En stock", "Sous 48h", "Sous 5 jours"]),
      delivery: pick(["Gratuite", "Gratuite", "9,99 EUR", "19,99 EUR"]),
      warranty: pick(["2 ans", "2 ans", "3 ans", "5 ans"]),
      score: score,
      status: st.label,
      statusColor: st.color,
      confidence: pick(["Elevee", "Bonne", "Moyenne"]),
      freshness: pick(["Tres recente", "Recente"]),
      pefas: {
        P: Math.min(100, Math.max(10, score + rand(-15, 15))),
        E: Math.min(100, Math.max(10, score + rand(-15, 15))),
        F: Math.min(100, Math.max(10, score + rand(-15, 15))),
        A: Math.min(100, Math.max(10, score + rand(-15, 15))),
        S: Math.min(100, Math.max(10, score + rand(-15, 15))),
      },
      mimoShort: pick(MIMO_SHORTS),
      reasons: Array.from({ length: rand(3, 5) }, () => pick(REASONS)),
      vigilances: Array.from({ length: rand(2, 3) }, () => pick(VIGILANCES)),
    });
  });
});

export const PROJECTS = [
  {
    id: "p1",
    name: "Cuisine complete",
    category: "Electromenager",
    budget: "2 500 EUR",
    state: "En cours",
    offers: OFFERS.filter((o) => o.category === "electromenager")
      .slice(0, 3)
      .map((o) => o.id),
    objective: "Equiper la cuisine du nouvel appartement",
    updatedAt: "Il y a 2 jours",
    score: 74,
  },
  {
    id: "p2",
    name: "Salon TV",
    category: "Televiseurs",
    budget: "1 200 EUR",
    state: "En cours",
    offers: OFFERS.filter((o) => o.category === "televiseurs")
      .slice(0, 2)
      .map((o) => o.id),
    objective: "Remplacer la TV du salon",
    updatedAt: "Il y a 5 jours",
    score: 0,
  },
];

export const USER = {
  name: "Mohamed",
  initials: "M",
  budget: "Modere",
  usage: "Usage quotidien",
  priority: "Fiabilite",
  horizon: "3-5 ans",
  risk: "Prudent",
  level: 3,
  grade: "Analyste",
  badges: ["Premier score", "Explorateur", "Comparateur"],
  contributions: 12,
  reputation: 4.2,
};