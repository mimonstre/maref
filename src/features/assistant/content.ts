export type AssistantMessage = {
  from: "mimo" | "user";
  text: string;
  source?: "ai" | "local";
};

export type MimoContext = {
  projects?: { name: string; offers: number; score: number; category?: string }[];
  favCount?: number;
  preferredBudget?: string;
  preferredPriority?: string;
  decisionStyle?: string;
  household?: string;
  housingType?: string;
  supportStyle?: string;
  hasProjects?: boolean;
  totalOffers?: number;
  recentSearches?: string[];
  recentViews?: string[];
  location?: string;
};

export const ASSISTANT_SUGGESTIONS = [
  "Aide-moi à cadrer mon besoin",
  "Que penses-tu de mon projet actuel ?",
  "Explique-moi le score MAREF",
  "Comment bien comparer 2 ou 3 offres ?",
  "Quelles erreurs éviter avant d’acheter ?",
  "Par quoi commencer pour choisir ?",
];

type IntentKey =
  | "score"
  | "pefas"
  | "besoin"
  | "comparaison"
  | "projet"
  | "favoris"
  | "budget"
  | "risque"
  | "fiche"
  | "marchand"
  | "garantie"
  | "livraison"
  | "meilleur"
  | "guide"
  | "mimo"
  | "hors_sujet"
  | "bonjour"
  | "merci";

const RESPONSE_MAP: Record<IntentKey, string[]> = {
  score: [
    "Le score MAREF sert à lire une offre marchande, pas une fiche produit. Il synthétise cinq axes : Pertinence, Économie, Fluidité, Assurance et Stabilité. La bonne lecture consiste à regarder la note globale puis les axes qui tirent la décision vers le haut ou vers le bas.",
    "Le score MAREF vous aide à arbitrer entre plusieurs offres comparables. Une note élevée est utile, mais elle n’a de sens que si elle reste cohérente avec votre besoin, votre budget, le marchand et les points de vigilance visibles sur l’offre.",
  ],
  pefas: [
    "PEFAS veut dire Pertinence, Économie, Fluidité, Assurance et Stabilité. Chaque axe répond à une question différente : est-ce adapté à votre besoin, est-ce rentable, est-ce simple à acheter, est-ce rassurant côté marchand, et est-ce solide dans le temps ?",
    "Les axes PEFAS servent à éviter les décisions trop simplistes. Une offre peut être bonne en prix mais faible en garantie, ou très pertinente techniquement mais peu rassurante côté marchand. C’est justement cette lecture que MAREF rend plus visible.",
  ],
  besoin: [
    "Pour cadrer un besoin proprement, il faut d’abord fixer trois choses : l’usage réel, les contraintes non négociables et le niveau d’exigence accepté. Si vous me donnez la famille de produit et ces trois éléments, je peux vous aider à poser une vraie short-list.",
    "Le bon point de départ n’est pas la promo, ni la marque, ni la fiche la plus spectaculaire. Le bon point de départ, c’est votre contexte : pour qui, à quelle fréquence, dans quel espace, avec quel niveau d’exigence et quelle durée d’usage.",
  ],
  comparaison: [
    "Une bonne comparaison MAREF se fait idéalement sur 2 ou 3 offres d’une même famille. Au-delà, le bruit augmente. On lit d’abord les écarts de score et d’axes, puis seulement les données techniques qui expliquent ces écarts.",
    "Comparer correctement, ce n’est pas aligner le plus de lignes possible. C’est isoler les critères qui changent vraiment la décision : capacité, bruit, autonomie, garantie, dimensions, technologie, cadre marchand ou stabilité de l’offre.",
  ],
  projet: [
    "Un projet sert à réunir plusieurs offres autour d’un même achat à arbitrer. C’est la meilleure façon de relier budget, objectif, références et comparaison, au lieu de laisser des offres isolées flotter sans contexte.",
    "La vraie force d’un projet MAREF, c’est qu’il vous oblige à donner une forme à votre décision : un objectif, une famille, des offres suivies et un moment où il faut trancher. C’est ce qui fait passer d’un catalogue à un choix argumenté.",
  ],
  favoris: [
    "Les favoris doivent servir à garder une short-list temporaire, pas à empiler sans fin. Si vous en avez beaucoup, la meilleure suite est souvent de les répartir par projet ou d’en envoyer 2 ou 3 dans le comparateur.",
    "Un favori est utile s’il mène à une action : comparer, ajouter à un projet, ou éliminer. Si une offre reste longtemps en favori sans avancer, c’est souvent qu’il manque un critère de décision clair.",
  ],
  budget: [
    "Le budget ne doit pas être lu comme un plafond abstrait. Il faut le relier au niveau d’usage, au coût d’erreur acceptable et à la durée prévue de conservation. Un achat un peu plus cher peut être plus cohérent si le risque baisse nettement.",
    "Quand le budget est serré, la bonne méthode consiste à protéger les critères non négociables et à assumer clairement les concessions secondaires. Je peux vous aider à faire cette hiérarchie si vous me dites ce qui compte le plus.",
  ],
  risque: [
    "Le risque d’une offre ne vient pas seulement du produit. Il vient aussi du manque d’information, du vendeur, de la garantie, de la disponibilité réelle et de la difficulté à corriger un mauvais achat. C’est là que MAREF doit vous ralentir plutôt que vous pousser.",
    "Quand une offre semble séduisante mais que la donnée est pauvre, la bonne posture n’est pas d’inventer le reste. C’est d’assumer que la comparaison devient partielle. Je peux vous aider à repérer ce qui manque vraiment avant de décider.",
  ],
  fiche: [
    "Une fiche produit doit vous aider à comprendre le produit lui-même. Une offre marchande, elle, ajoute le marchand, le prix, la garantie, la livraison et le score MAREF. C’est une distinction importante pour éviter les malentendus dans la décision.",
    "Pour lire une fiche sans se perdre, il faut distinguer les caractéristiques structurantes des détails secondaires. Dites-moi la famille de produit et je peux vous dire exactement quelles données comptent vraiment.",
  ],
  marchand: [
    "Le marchand compte davantage qu’on ne le croit. Une offre proche en prix peut devenir moins intéressante si la garantie est faible, la politique de retour opaque ou la livraison peu fiable. C’est précisément pour cela que le score n’est pas uniquement technique.",
    "Un bon vendeur ne se résume pas à un logo connu. Il faut regarder la clarté des conditions, la lisibilité de l’offre, la cohérence des promesses et le niveau de rassurance si quelque chose tourne mal après l’achat.",
  ],
  garantie: [
    "La garantie est un signal utile, mais elle doit être lue avec le reste : marchand, retour, lisibilité des conditions et stabilité de l’offre. Une garantie longue aide, mais elle ne corrige pas un vendeur flou ou une fiche pauvre.",
    "Sur les achats techniques ou chers, la garantie fait partie des critères qui protègent vraiment la décision. Une offre légèrement plus chère peut rester meilleure si elle réduit fortement le risque après achat.",
  ],
  livraison: [
    "La livraison influence la qualité réelle de l’offre : délai, fiabilité, coût, clarté et capacité à tenir la promesse. Ce n’est pas juste un détail logistique, c’est une partie du confort d’achat.",
    "Quand la livraison est floue, la fluidité baisse mécaniquement. Une offre très compétitive peut perdre beaucoup d’intérêt si le délai, la disponibilité ou le retour ne sont pas clairs.",
  ],
  meilleur: [
    "La meilleure offre n’est jamais universelle. C’est celle qui aligne le mieux votre besoin, votre niveau d’exigence, votre tolérance au risque et le cadre marchand concret. Si vous me donnez la famille ou le projet concerné, je peux raisonner proprement avec vous.",
    "Pour trouver ce qui est le mieux pour vous, il faut choisir le bon angle : meilleure valeur, meilleur équilibre, meilleur niveau de sécurité, ou meilleur rapport qualité/prix selon votre contexte. Je peux vous aider à poser cet angle avant de trancher.",
  ],
  guide: [
    "Le guide sert à rendre vos décisions plus solides, pas à empiler des contenus théoriques. Il est le plus utile quand vous l’utilisez juste avant une vraie comparaison ou un vrai arbitrage.",
    "Si vous hésitez, je peux vous orienter vers le bon module du guide selon votre situation : cadrer un besoin, lire une offre, comparer proprement ou sécuriser un achat.",
  ],
  mimo: [
    "Je suis Mimo, l’assistant décisionnel de MAREF. Mon rôle n’est pas de faire du marketing. Mon rôle est de rendre une décision plus claire, plus argumentée et plus honnête quand l’information est incomplète.",
    "Je peux vous aider sur le produit, sur vos projets, sur la lecture d’une offre, sur une comparaison, et aussi sur des questions plus générales tant que je reste clair sur ce qui relève du contexte MAREF et de ce qui n’en relève pas.",
  ],
  hors_sujet: [
    "Je peux aussi répondre à une question plus générale si vous voulez. Je ne vais pas prétendre qu’elle vient du produit MAREF, mais je peux quand même vous aider proprement, puis éventuellement rattacher la réponse à une décision d’achat si c’est utile.",
    "Même hors du cadre direct de MAREF, je peux essayer d’être utile. Donnez-moi juste votre objectif, et je vous répondrai clairement en distinguant ce qui relève du bon sens général et ce qui dépendrait de données produit réelles.",
  ],
  bonjour: [
    "Bonjour. Je suis Mimo. Dites-moi ce que vous essayez d’acheter, de comparer ou de comprendre, et je vous aide à poser une décision propre.",
    "Bonjour. On peut partir d’un besoin, d’une famille de produit, d’un projet, d’une comparaison ou d’une question libre. Je m’adapte.",
  ],
  merci: [
    "Avec plaisir. Si vous voulez, on peut continuer en cadrant le besoin, en lisant une offre ou en préparant une comparaison propre.",
    "Avec plaisir. Si un doute reste flou, reformulez-le comme une décision concrète à prendre et je vous aiderai plus directement.",
  ],
};

function pick(variants: string[]) {
  return variants[Math.floor(Math.random() * variants.length)];
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectIntent(input: string): IntentKey | null {
  const lower = normalize(input);
  const rules: Array<{ key: IntentKey; patterns: Array<string | RegExp> }> = [
    { key: "bonjour", patterns: [/\bbonjour\b/, /\bsalut\b/, /\bhello\b/, /\bbonsoir\b/] },
    { key: "merci", patterns: [/\bmerci\b/, /\bthanks\b/, /\btop merci\b/] },
    { key: "score", patterns: [/\bscore\b/, /\bnote\b/, /\bevaluation\b/] },
    { key: "pefas", patterns: [/\bpefas\b/, /\bpertinence\b/, /\beconomie\b/, /\bfluidite\b/, /\bassurance\b/, /\bstabilite\b/] },
    { key: "comparaison", patterns: [/\bcompar/, /\barbitr/, /\bface a\b/, /\bversus\b/, /\bvs\b/] },
    { key: "projet", patterns: [/\bprojet\b/, /\bshort list\b/, /\bshortlist\b/] },
    { key: "favoris", patterns: [/\bfavori\b/, /\bsauvegard/, /\bselection\b/] },
    { key: "budget", patterns: [/\bbudget\b/, /\bprix\b/, /\bcher\b/, /\bmoins cher\b/, /\brapport qualite prix\b/] },
    { key: "risque", patterns: [/\brisque\b/, /\bfiable\b/, /\bdoute\b/, /\bincertain\b/, /\bmanque d information\b/] },
    { key: "fiche", patterns: [/\bfiche\b/, /\bspec\b/, /\bcaracter/, /\bdonnee technique\b/] },
    { key: "marchand", patterns: [/\bmarchand\b/, /\bvendeur\b/, /\benseigne\b/, /\bsite marchand\b/] },
    { key: "garantie", patterns: [/\bgaranti\b/, /\bsav\b/, /\bretour\b/] },
    { key: "livraison", patterns: [/\blivraison\b/, /\bdelai\b/, /\bexpedition\b/, /\bstock\b/] },
    { key: "meilleur", patterns: [/\bmeilleur\b/, /\brecommand/, /\bchoix\b/, /\bqu est ce qui est le mieux\b/] },
    { key: "guide", patterns: [/\bguide\b/, /\bmodule\b/, /\bquiz\b/, /\bformation\b/] },
    { key: "besoin", patterns: [/\bbesoin\b/, /\bchoisir\b/, /\bcomment choisir\b/, /\bcadrer\b/] },
    { key: "mimo", patterns: [/\bmimo\b/, /\btu es qui\b/, /\bqui es tu\b/, /\bque peux tu faire\b/] },
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => (typeof pattern === "string" ? lower.includes(pattern) : pattern.test(lower)))) {
      return rule.key;
    }
  }

  if (lower.includes("meteo") || lower.includes("recette") || lower.includes("vacances") || lower.includes("politique")) {
    return "hors_sujet";
  }

  return null;
}

function buildContextPrefix(context?: MimoContext) {
  if (!context) return "";

  const fragments: string[] = [];

  if (context.projects?.length) {
    const mainProject = context.projects[0];
    fragments.push(
      `Je vois ${context.projects.length} projet${context.projects.length > 1 ? "s" : ""}, dont ${mainProject.name} avec ${mainProject.offers} offre${mainProject.offers > 1 ? "s" : ""}.`,
    );
  }

  if (context.recentSearches?.length) {
    fragments.push(`Vos dernières recherches portent sur ${context.recentSearches.slice(0, 2).join(" et ")}.`);
  }

  if (context.recentViews?.length) {
    fragments.push(`Vos dernières consultations incluent ${context.recentViews.slice(0, 2).join(" et ")}.`);
  }

  if (context.preferredPriority) {
    fragments.push(`Votre priorité déclarée est ${context.preferredPriority.toLowerCase()}.`);
  }

  if (context.supportStyle) {
    fragments.push(`Vous préférez un accompagnement ${context.supportStyle.toLowerCase()}.`);
  }

  return fragments.length > 0 ? fragments.join(" ") + " " : "";
}

function buildClarifyingQuestion(input: string, context?: MimoContext) {
  const prefix = buildContextPrefix(context);
  return (
    prefix +
    `Je peux vous aider sur “${input.trim()}”, mais j’ai besoin d’un angle plus net. Dites-moi si vous voulez : comprendre une offre, comparer 2 ou 3 options, choisir la bonne famille de produit, ou sécuriser une décision déjà engagée.`
  );
}

export function getMimoResponse(input: string, context?: MimoContext): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "Posez-moi votre question comme vous le feriez à un humain : besoin, doute, comparaison, budget, marchand ou simplement une idée d’achat à cadrer.";
  }

  const intent = detectIntent(trimmed);
  if (intent && RESPONSE_MAP[intent]) {
    return buildContextPrefix(context) + pick(RESPONSE_MAP[intent]);
  }

  if (context?.projects?.length || context?.recentSearches?.length || context?.recentViews?.length) {
    return buildClarifyingQuestion(trimmed, context);
  }

  return (
    "Je peux répondre, même si la demande est encore large. " +
    `Si vous parlez de “${trimmed}”, dites-moi simplement le produit concerné, votre contrainte principale et ce que vous voulez obtenir : une explication, une recommandation, une comparaison ou un cadrage du besoin.`
  );
}

export function getMimoContextualResponse(input: string, context: MimoContext) {
  return getMimoResponse(input, context);
}
