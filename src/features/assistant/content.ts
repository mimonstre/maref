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
  hasProjects?: boolean;
  totalOffers?: number;
  recentSearches?: string[];
  recentViews?: string[];
  location?: string;
};

export const ASSISTANT_SUGGESTIONS = [
  "Mes meilleurs choix actuels",
  "Aide-moi a cadrer mon besoin",
  "Comment fonctionne le score ?",
  "Que signifie PEFAS ?",
  "Aide-moi a comparer",
  "Conseils pour mon budget",
];

// ---------------------------------------------------------------------------
// Response variants – each key has at least 2 variants, randomly picked
// ---------------------------------------------------------------------------

type ResponseVariants = string[];

const RESPONSE_MAP: Record<string, ResponseVariants> = {
  // --- Score ---
  score: [
    "Le Score MAREF evalue chaque offre sur 100 points en combinant 5 axes : Pertinence, Economie, Fluidite, Assurance et Stabilite. Un score de 85+ est excellent, 70-84 tres bon, 55-69 correct. Conseil : regardez aussi les axes individuels, pas seulement la note globale.",
    "Le score global est une synthese ponderee des 5 axes PEFAS. Ce n est pas une simple moyenne : chaque axe est pondere selon votre profil et votre contexte projet. Un acheteur qui privilege la durabilite verra l axe S (Stabilite) plus fortement valorise.",
  ],

  // --- PEFAS general ---
  pefas: [
    "PEFAS = Pertinence, Economie, Fluidite, Assurance, Stabilite. Chaque axe est note sur 100. La Pertinence mesure l adequation au besoin, l Economie le rapport cout/valeur, la Fluidite la facilite d achat, l Assurance la fiabilite marchande, la Stabilite la perenni­te produit/marque.",
    "Les 5 axes PEFAS sont complementaires : une offre peut avoir un excellent prix (E eleve) mais une garantie faible (A basse). MAREF vous montre ces desequilibres pour que vous achetiez en connaissance de cause, pas juste sur l etiquette de prix.",
  ],

  // --- Pertinence (P) ---
  pertinence: [
    "L axe Pertinence (P) mesure si l offre repond vraiment a votre besoin. Une machine a laver 7 kg pour un celibataire peut etre tres pertinente (P=90), mais surdimensionnee pour un studio (P=55). Definissez votre usage reel avant tout.",
    "La Pertinence evalue l adequation technique au besoin declare. Conseil : remplissez votre profil decision (usage, horizon, intensite) pour que MAREF calibre cet axe sur votre situation reelle.",
  ],

  // --- Economie (E) ---
  economie: [
    "L axe Economie (E) va au-dela du prix affiché : il integre le cout total etendu (achat + usage + maintenance sur la duree). Un appareil moins cher a l achat peut couter plus cher sur 5 ans. Regardez toujours le E avant de decider sur le prix.",
    "Economie ne veut pas dire « le moins cher ». MAREF calcule un indice cout/valeur : si une offre a un bon E, c est qu elle delivre beaucoup pour son prix. Parfois payer 10% de plus achete 30% de valeur supplementaire.",
  ],

  // --- Fluidite (F) ---
  fluidite: [
    "L axe Fluidite (F) evalue la facilite de l experience d achat : disponibilite immediate, livraison rapide, retour simple, service client accessible. Un score F bas signifie des frictions potentielles : delais, rupture, SAV difficile.",
    "La Fluidite mesure ce que vous vivrez apres avoir clique sur Acheter. Livraison en 24h, stock confirme, politique de retour claire : ces elements sont scorises. Un F > 75 indique une experience d achat sereine.",
  ],

  // --- Assurance (A) ---
  assurance: [
    "L axe Assurance (A) couvre la confiance marchande : reputation du vendeur, garantie proposee, politique SAV, historique de fiabilite. Un A eleve signifie que vous etes protege si quelque chose tourne mal.",
    "L Assurance note la securite de votre achat : garantie legale + commerciale, marchand verifie, politique de retour honnete. Ne negligez pas cet axe, surtout sur les produits techniques ou onereu­x.",
  ],

  // --- Stabilite (S) ---
  stabilite: [
    "L axe Stabilite (S) evalue la perenni­te de l offre : la marque est-elle solide ? Le modele va-t-il continuer a etre supporte ? Les prix sont-ils stables ? Un S eleve protege votre investissement dans la duree.",
    "La Stabilite anticipe les risques a moyen terme : obsolescence, discontinuation, instabilite tarifaire. Pour les achats sur 5 ans ou plus, cet axe est critique. Privilegiez un S > 70 sur les electromenager et electronique grand public.",
  ],

  // --- Comparaison ---
  comparaison: [
    "Pour comparer efficacement, selectionnez 2 a 3 offres dans l Explorer et rendez-vous dans la section Comparer. Je vous montrerai les differences axe par axe, le cout total etendu, et je vous dirai laquelle est la plus adaptee a votre profil.",
    "La comparaison MAREF va au-dela des fiches techniques : elle analyse les ecarts sur chaque axe PEFAS et calcule un gagnant contextualise par votre profil. Astuce : ajoutez une offre budget et une offre premium pour visualiser le saut de valeur.",
  ],

  // --- Favoris ---
  favoris: [
    "Vos offres en favoris sont accessibles dans la section Favoris. Conseil : ajoutez plusieurs offres d une meme categorie pour les comparer sereinement avant de decider, sans perdre vos recherches.",
    "Les favoris servent d espace de reflexion : ajoutez les offres qui vous interessent, laissez reposer 24h, puis revenez les comparer. Les decisions prises apres une nuit de recul sont generalement meilleures.",
  ],

  // --- Projet ---
  projet: [
    "Un projet MAREF vous permet de regrouper les offres que vous evaluez pour un meme besoin (ex : renovation cuisine). Toutes les offres ajoutees sont comparees dans leur contexte : budget cible, objectif, duree d usage.",
    "Creez un projet pour chaque decision d achat importante. MAREF adapte alors le score de chaque offre a votre contexte specifique : deux offres identiques peuvent avoir des scores differents selon le projet dans lequel vous les evaluez.",
  ],

  // --- Bonne affaire ---
  "bonne affaire": [
    "Une bonne affaire selon MAREF n est pas forcement l offre la moins chere : c est celle qui offre le meilleur rapport score/prix. Cherchez les offres avec un score MAREF superieur a 80 et un axe Economie superieur a 75.",
    "Les vraies bonnes affaires combinent un score global solide ET un E (Economie) eleve. Evitez les offres ou le prix barre est artificiel (prix reference gonfle). MAREF signale ces cas dans les vigilances.",
  ],

  // --- Garantie ---
  garantie: [
    "La garantie est integree dans l axe Assurance (A). Attention : la garantie legale de 2 ans s applique partout en France, mais la garantie commerciale du marchand fait toute la difference pour la simplicite du retour SAV.",
    "Une garantie de 3 ans ou plus est un signal positif de confiance du fabricant dans son produit. MAREF valorise les garanties etendues dans l axe A. Pour les produits reconditiones, verifiez la duree : minimum 12 mois recommandes.",
  ],

  // --- Marchand ---
  marchand: [
    "MAREF evalue les marchands sur leur historique de livraison, politique de retour, disponibilite du SAV et avis verifies. L axe Assurance (A) reflate directement la fiabilite marchande. Privilegiez un A > 70 pour les achats importants.",
    "Tous les marchands ne se valent pas : certains affi­chent des prix attractifs mais ont un SAV defaillant. MAREF integre des donnees de fiabilite marchande dans l axe A pour vous alerter avant que vous ne commandez.",
  ],

  // --- Livraison ---
  livraison: [
    "La livraison est scorisee dans l axe Fluidite (F) : delai annonce, disponibilite confirmee, suivi de commande. Un F eleve indique une livraison rapide et fiable. Conseil : verifiez toujours la date de disponibilite avant d acheter.",
    "Les delais de livraison affiches ne sont pas toujours respectes. MAREF croise les donnees de disponibilite reelle avec les promesses marchandes. Si le F est bas, attendez-vous a des frictions potentielles.",
  ],

  // --- Retour ---
  retour: [
    "La politique de retour est un element cle : verifiez le delai (14 jours minimum legalement, 30 jours recommandes), les frais de retour a votre charge, et les conditions d etat du produit. Tout cela impacte l axe A.",
    "Un retour facile est un signal de marchand confiant dans ses produits. Les marchands qui compliquent les retours le font souvent parce qu ils savent que le taux de problemes est eleve. Privilegiez les retours gratuits et sans questions.",
  ],

  // --- Budget ---
  budget: [
    "Avec un budget serre, concentrez-vous sur les offres avec un bon score Economie (E > 70). Le cout total etendu peut surprendre : mieux vaut parfois payer 15% de plus a l achat si l appareil consomme 30% moins sur 5 ans.",
    "Definissez votre budget avec une marge de 10-15% : les meilleures offres ne tombent pas toujours exactement sur le budget cible. MAREF vous permet de parametrer votre budget dans le profil et dans chaque projet.",
  ],

  // --- Durabilite ---
  durabilite: [
    "La durabilite est evaluee via l axe Stabilite (S) et partiellement via Economie (E). Les produits durables ont generalement un cout total etendu plus faible. Privilegiez les marques avec un bon historique de disponibilite des pieces detachees.",
    "Un produit durable reduit votre empreinte et votre cout sur la duree. MAREF integre l indice de reparabilite quand il est disponible dans l axe S. Visez S > 70 pour les achats que vous souhaitez garder plus de 5 ans.",
  ],

  // --- Fiabilite ---
  fiabilite: [
    "La fiabilite combine l axe Assurance (A) et l axe Stabilite (S) : fiabilite marchande d un cote, perenni­te produit de l autre. Un double score > 75 sur ces deux axes est le signal d un achat serein.",
    "Pour evaluer la fiabilite, regardez les vigilances signalee par Mimo sur chaque offre. Si aucune vigilance n est listee et que A et S sont tous deux au-dessus de 70, vous pouvez acheter avec confiance.",
  ],

  // --- Mimo lui-meme ---
  mimo: [
    "Je suis Mimo, l assistant decisionnel de MAREF. Je ne vends rien, je ne suis pas paye par les marchands. Mon seul objectif : vous aider a choisir intelligemment, proteger votre pouvoir d achat, eviter les mauvaises surprises.",
    "Mimo (c est moi !) analyse les offres avec le framework PEFAS et contextualise les scores selon votre profil. Je combine des donnees structurees, des regles metier et votre contexte pour vous donner un avis neutre et actionnable.",
  ],

  // --- Meilleur choix / recommandation ---
  meilleur: [
    "La meilleure offre est celle qui aligne le mieux le score global, le budget, l horizon d usage et votre priorite principale. MAREF la calcule pour vous dans la section Comparer ou dans un projet. Aucune offre n est universellement la meilleure.",
    "D apres le top des offres actuellement analysees, privilegiez celles avec un score > 80 et un axe Economie > 70. Elles offrent le meilleur rapport qualite globale / valeur marche. Consultez l Explorer pour voir le classement en temps reel.",
  ],

  // --- Guide / aide ---
  aide: [
    "Je peux vous aider sur : le fonctionnement du score PEFAS, l analyse d une offre, la comparaison entre produits, la gestion de vos projets et favoris, ou simplement vous orienter vers la bonne section. Posez votre question !",
    "Pour bien demarrer sur MAREF : (1) completez votre profil decision, (2) explorez les offres par categorie, (3) sauvegardez vos favoris, (4) creez un projet pour votre achat principal. Je suis la pour vous guider a chaque etape.",
  ],
  besoin: [
    "Pour bien cadrer votre besoin, dites-moi la famille de produit, le budget cible, les 2 ou 3 criteres non negociables et votre horizon d usage. Je pourrai alors vous dire quoi comparer et quoi ignorer.",
    "On peut repartir du besoin proprement : quel produit cherchez-vous, pour qui, dans quel contexte, avec quelles contraintes reelles ? Une fois cela pose, je peux vous guider vers les bonnes sous-categories et les bons arbitrages.",
  ],
  location: [
    "Si vous renseignez votre localisation dans le profil, MAREF peut privilegier les offres et signaux utiles autour de chez vous quand ces donnees existent. Cela sert surtout a contextualiser la recommandation, pas a inventer une disponibilite locale.",
    "La localisation ne sert pas au decor. Elle aide a prioriser des offres plus pertinentes localement quand l information existe et a mieux cadrer la decision selon votre zone.",
  ],
  technique: [
    "Pour lire une fiche technique sans se perdre, il faut separer les specs structurantes des specs secondaires. Dites-moi la famille de produit et je vous dirai exactement quoi regarder en priorite.",
    "Les donnees techniques ne valent que si elles sont reliees a votre usage. Je peux vous aider a traduire une fiche en impact concret : bruit, autonomie, capacite, dimensions, memoire, garantie ou risque.",
  ],

  // --- Salutation ---
  bonjour: [
    "Bonjour ! Je suis Mimo, votre assistant decisionnel MAREF. Posez-moi n importe quelle question sur les offres, le score, vos projets ou vos favoris.",
    "Salut ! Mimo a votre service. Je suis la pour vous aider a decider intelligemment. Que voulez-vous analyser aujourd hui ?",
  ],

  // --- Merci ---
  merci: [
    "Avec plaisir ! N hesitez pas si vous avez d autres questions. Mon seul objectif : vous aider a faire le meilleur choix possible.",
    "De rien ! Si vous avez un doute sur une offre ou une comparaison, revenez quand vous voulez. C est pour ca que je suis la.",
  ],
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function pick(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)];
}

function matchKeyword(lower: string): string | null {
  // Order matters: more specific patterns first
  const rules: [RegExp | string, string][] = [
    [/\bpertinence\b|\baxe p\b/, "pertinence"],
    [/\beconomie\b|\baxe e\b/, "economie"],
    [/\bfluidite\b|\baxe f\b/, "fluidite"],
    [/\bassurance\b|\baxe a\b/, "assurance"],
    [/\bstabilite\b|\baxe s\b/, "stabilite"],
    [/\bpefas\b|\bcinq axe|\b5 axe/, "pefas"],
    [/\bscore\b|\bnotation\b|\bevaluation\b/, "score"],
    [/\bcompar/, "comparaison"],
    [/\bfavori/, "favoris"],
    [/\bprojet\b/, "projet"],
    [/\bbonne affaire\b|\bpromo\b|\bsolde\b|\baffaire\b/, "bonne affaire"],
    [/\bgaranti/, "garantie"],
    [/\bmarchand\b|\bvendeur\b|\bshop\b/, "marchand"],
    [/\blivraison\b|\bdelai\b|\bexpedition\b/, "livraison"],
    [/\bretour\b|\bremboursement\b/, "retour"],
    [/\bbudget\b|\bprix\b|\bcout\b|\bcher\b/, "budget"],
    [/\bdurabilit/, "durabilite"],
    [/\bfiabilit/, "fiabilite"],
    [/\bmimo\b|\btu es qui\b|\bqui es-tu\b/, "mimo"],
    [/\bmeilleur\b|\brecommand|\bconseill/, "meilleur"],
    [/\bbesoin\b|\bchoisir\b|\bcadrer\b/, "besoin"],
    [/\blocalisation\b|\bautour de chez moi\b|\bpres de chez moi\b/, "location"],
    [/\btechnique\b|\bspec\b|\bfiche produit\b|\bcaracterist/, "technique"],
    [/\bbonjour\b|\bsalut\b|\bhello\b|\bhi\b/, "bonjour"],
    [/\bmerci\b|\bthanks\b/, "merci"],
    [/\baide\b|\baider\b|\bcomment\b|\bquoi\b|\bque faire\b/, "aide"],
  ];

  for (const [pattern, key] of rules) {
    if (typeof pattern === "string") {
      if (lower.includes(pattern)) return key;
    } else {
      if (pattern.test(lower)) return key;
    }
  }
  return null;
}

function buildContextualPrefix(context: MimoContext, key: string): string {
  if (!context) return "";

  if (key === "projet" && context.projects && context.projects.length > 0) {
    const first = context.projects[0];
    const count = context.projects.length;
    return (
      "Tu as " +
      count +
      " projet" +
      (count > 1 ? "s" : "") +
      " en cours. Ton projet principal est \"" +
      first.name +
      "\" avec " +
      first.offers +
      " offre" +
      (first.offers > 1 ? "s" : "") +
      " analysee" +
      (first.offers > 1 ? "s" : "") +
      (first.score > 0 ? " (score moyen : " + first.score + "/100)" : "") +
      ". "
    );
  }

  if (key === "favoris" && context.favCount !== undefined && context.favCount > 0) {
    return (
      "Tu as " +
      context.favCount +
      " offre" +
      (context.favCount > 1 ? "s" : "") +
      " sauvegardee" +
      (context.favCount > 1 ? "s" : "") +
      " en favoris. "
    );
  }

  if (key === "budget" && context.preferredBudget) {
    return "Ton profil indique un budget " + context.preferredBudget.toLowerCase() + ". ";
  }

  if (key === "meilleur" && context.preferredPriority) {
    return "Avec ta priorite \"" + context.preferredPriority + "\", voici comment je vois les choses. ";
  }

  if (key === "comparaison" && context.recentSearches && context.recentSearches.length > 0) {
    return "Tes dernieres recherches tournent autour de " + context.recentSearches.slice(0, 2).join(" et ") + ". ";
  }

  if (key === "meilleur" && context.recentViews && context.recentViews.length > 0) {
    return "Parmi tes consultations recentes, je garderais en tete " + context.recentViews.slice(0, 2).join(" et ") + ". ";
  }

  return "";
}

function buildAnalyticalFallback(input: string, context?: MimoContext) {
  const fragments: string[] = [];

  if (context?.projects && context.projects.length > 0) {
    const project = context.projects[0];
    fragments.push(
      `Votre projet le plus recent est ${project.name} avec ${project.offers} offre${project.offers > 1 ? "s" : ""}.`,
    );
  }

  if (context?.recentSearches && context.recentSearches.length > 0) {
    fragments.push(`Vos recherches recentes tournent autour de ${context.recentSearches.slice(0, 2).join(" et ")}.`);
  }

  if (context?.recentViews && context.recentViews.length > 0) {
    fragments.push(`Vos dernieres fiches consultees incluent ${context.recentViews.slice(0, 2).join(" et ")}.`);
  }

  if (context?.preferredPriority) {
    fragments.push(`Votre priorite declaree est ${context.preferredPriority.toLowerCase()}.`);
  }

  const detectedNeed = input
    .replace(/[?!.]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 10)
    .join(" ");

  return (
    (fragments.length > 0 ? fragments.join(" ") + " " : "") +
    "Je peux traiter cette demande, mais il me faut un angle plus explicite. " +
    `Si vous parlez de "${detectedNeed}", dites-moi si vous voulez : cadrer le besoin, comprendre une fiche, comparer 2 ou 3 references, verifier le risque marchand, ou choisir la meilleure option selon votre contexte.`
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getMimoResponse(input: string, context?: MimoContext): string {
  const lower = input.toLowerCase().trim();
  const key = matchKeyword(lower);

  if (key && RESPONSE_MAP[key]) {
    const prefix = context ? buildContextualPrefix(context, key) : "";
    return prefix + pick(RESPONSE_MAP[key]);
  }

  if (lower.includes("quel est le meilleur") || lower.includes("qu est ce qui est le mieux pour moi")) {
    return buildContextualPrefix(context || {}, "meilleur") + pick(RESPONSE_MAP.meilleur);
  }

  if (context?.recentSearches && context.recentSearches.length > 0) {
    return (
      "Je n ai pas compris exactement la demande, mais vos recherches recentes portent sur " +
      context.recentSearches.slice(0, 3).join(", ") +
      ". Je peux vous aider a comparer ces familles, expliquer le score, ou vous recommander un prochain arbitrage."
    );
  }

  if (context?.projects && context.projects.length > 0) {
    const name = context.projects[0].name;
    return (
      "Je n ai pas compris exactement votre question, mais je vois que vous avez un projet \"" +
      name +
      "\" en cours. Voulez-vous que je l analyse, que je compare les offres, ou que je vous explique un axe PEFAS ?"
    );
  }

  return buildAnalyticalFallback(input, context);
}

export function getMimoContextualResponse(input: string, context: MimoContext): string {
  return getMimoResponse(input, context);
}
