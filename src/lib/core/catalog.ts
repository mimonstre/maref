import type { CategoryDefinition } from "./types";

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "electromenager",
    name: "Gros electromenager",
    icon: "🏠",
    subs: [
      { id: "lave-linge", name: "Lave-linge", icon: "🫧" },
      { id: "seche-linge", name: "Seche-linge", icon: "🌬️" },
      { id: "lave-vaisselle", name: "Lave-vaisselle", icon: "🍽️" },
      { id: "fours", name: "Fours", icon: "🔥" },
      { id: "cuisson", name: "Cuisson", icon: "🍳" },
      { id: "hottes", name: "Hottes", icon: "💨" },
    ],
  },
  {
    id: "froid",
    name: "Froid",
    icon: "❄️",
    subs: [
      { id: "refrigerateurs", name: "Refrigerateurs", icon: "🧊" },
      { id: "congelation", name: "Congelation", icon: "🥶" },
      { id: "caves-a-vin", name: "Caves a vin", icon: "🍷" },
      { id: "multidoor", name: "Multidoor / americain", icon: "🚪" },
    ],
  },
  {
    id: "petit-electromenager",
    name: "Petit electromenager",
    icon: "☕",
    subs: [
      { id: "cafe", name: "Cafe", icon: "☕" },
      { id: "preparation-culinaire", name: "Preparation culinaire", icon: "🥣" },
      { id: "entretien-maison", name: "Entretien maison", icon: "🧹" },
      { id: "soin-personne", name: "Soin de la personne", icon: "💇" },
    ],
  },
  {
    id: "televiseurs",
    name: "Televiseurs",
    icon: "📺",
    subs: [
      { id: "oled-qled", name: "OLED / QLED", icon: "💡" },
      { id: "grand-format", name: "Grand format", icon: "📏" },
      { id: "home-cinema", name: "Home cinema", icon: "🎬" },
      { id: "gaming-tv", name: "TV gaming", icon: "🎮" },
    ],
  },
  {
    id: "telephonie",
    name: "Telephonie",
    icon: "📱",
    subs: [
      { id: "smartphones", name: "Smartphones", icon: "📱" },
      { id: "tablettes", name: "Tablettes", icon: "📲" },
      { id: "montres-connectees", name: "Montres connectees", icon: "⌚" },
      { id: "accessoires-mobile", name: "Accessoires mobile", icon: "🔌" },
    ],
  },
  {
    id: "informatique",
    name: "Informatique",
    icon: "💻",
    subs: [
      { id: "ordinateurs-portables", name: "Ordinateurs portables", icon: "💻" },
      { id: "ordinateurs-bureau", name: "Ordinateurs de bureau", icon: "🖥️" },
      { id: "ecrans", name: "Ecrans", icon: "🖥️" },
      { id: "composants", name: "Composants", icon: "🧩" },
    ],
  },
  {
    id: "jeux-video",
    name: "Jeux video",
    icon: "🎮",
    subs: [
      { id: "consoles", name: "Consoles", icon: "🎮" },
      { id: "pc-gaming", name: "PC gaming", icon: "🕹️" },
      { id: "accessoires-gaming", name: "Accessoires gaming", icon: "🎧" },
      { id: "jeux", name: "Jeux", icon: "🕹️" },
    ],
  },
];

export function getCategoryIcon(category: string) {
  return CATEGORIES.find((item) => item.id === category)?.icon || "📦";
}
