export type AssistantMessage = {
  from: "mimo" | "user";
  text: string;
};

export const ASSISTANT_SUGGESTIONS = [
  "Mes meilleurs choix actuels",
  "Comment fonctionne le score ?",
  "Que signifie PEFAS ?",
  "Aide-moi a comparer",
  "Conseils pour mon budget",
];

export const MIMO_RESPONSES: Record<string, string> = {
  "mes meilleurs choix actuels": "D apres votre profil, je vous orienterais vers les offres avec un score superieur a 80. Explorez la categorie Electromenager ou Froid pour voir les meilleures offres du moment. Le Miele SilentWash 7kg et le Sony PureBlack 65 pouces sont actuellement tres bien positionnes.",
  "comment fonctionne le score ?": "Le Score MAREF evalue chaque offre sur 100 points en combinant 5 axes : Pertinence, Economie, Fluidite, Assurance et Stabilite. Ce n est pas une simple moyenne, chaque axe est pondere selon votre profil. Un score de 85+ est excellent, 70-84 tres bon, 55-69 correct.",
  "que signifie pefas ?": "PEFAS est l acronyme des 5 axes d analyse MAREF : P = Pertinence, E = Economie, F = Fluidite, A = Assurance, S = Stabilite. Chaque axe est note sur 100 et influence le score global.",
  "aide-moi a comparer": "Pour comparer efficacement, allez dans la section Comparer. Recherchez 2 ou 3 offres qui vous interessent. Je vous montrerai les differences sur chaque axe PEFAS, le cout total etendu, et je vous dirai laquelle est la plus adaptee a votre profil.",
  "conseils pour mon budget": "Avec un budget modere, concentrez-vous sur les offres avec un bon score Economie. Ne regardez pas que le prix d achat : le cout total etendu inclut l usage sur plusieurs annees. Parfois, payer un peu plus a l achat reduit significativement le cout sur la duree.",
};

export function getMimoResponse(input: string): string {
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
  if (lower.includes("bonjour") || lower.includes("salut") || lower.includes("hello")) return "Bonjour ! Je suis Mimo, votre assistant decisionnel MAREF. Comment puis-je vous aider ?";
  if (lower.includes("merci")) return "Avec plaisir ! N hesitez pas si vous avez d autres questions.";

  return "Je comprends votre question. Pour vous aider au mieux, je vous suggere d explorer les offres disponibles dans l Explorer, ou de consulter le Guide pour mieux comprendre le fonctionnement de MAREF.";
}
