import type { CategoryDefinition } from "./types";

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "electromenager",
    name: "Electromenager",
    icon: "ðŸ ",
    subs: [
      { id: "lavage", name: "Lavage", icon: "ðŸ«§" },
      { id: "vaisselle", name: "Vaisselle", icon: "ðŸ½" },
    ],
  },
  {
    id: "froid",
    name: "Froid",
    icon: "â„ï¸",
    subs: [
      { id: "refrigerateurs", name: "Refrigerateurs", icon: "ðŸ§Š" },
      { id: "congelation", name: "Congelation", icon: "ðŸ¥¶" },
      { id: "multidoor", name: "Multidoor / americain", icon: "ðŸšª" },
    ],
  },
  {
    id: "televiseurs",
    name: "Televiseurs",
    icon: "ðŸ“º",
    subs: [
      { id: "technologie", name: "Technologie", icon: "ðŸ’¡" },
      { id: "taille", name: "Taille", icon: "ðŸ“" },
      { id: "usage-tv", name: "Usage", icon: "ðŸŽ®" },
    ],
  },
];

export function getCategoryIcon(category: string) {
  return CATEGORIES.find((item) => item.id === category)?.icon || "ðŸ“¦";
}
