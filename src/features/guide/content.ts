export type GuideCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type GuideLesson = {
  title: string;
  body: string;
};

export type GuideModule = {
  id: string;
  categoryId: string;
  title: string;
  desc: string;
  duration: string;
  difficulty: string;
  icon: string;
  content: GuideLesson[];
};

export type GuideQuiz = {
  id: string;
  categoryId: string;
  moduleId: string;
  title: string;
  description: string;
  questions: {
    q: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: "choisir",
    title: "Comment choisir ?",
    description: "Poser un vrai besoin, filtrer l’essentiel et choisir le bon appareil selon votre contexte réel.",
    icon: "🎯",
  },
  {
    id: "offre",
    title: "Comprendre une offre",
    description: "Lire les prix, le marché, l’enseigne, la garantie et le risque sans se faire embarquer.",
    icon: "🔎",
  },
  {
    id: "comparaison",
    title: "Comparer et décider",
    description: "Construire une short-list, lire PEFAS et trancher proprement entre plusieurs offres.",
    icon: "⚖️",
  },
];

function createQuestions(topic: string, context: string): GuideQuiz["questions"] {
  return [
    {
      q: `Quel est le bon point de départ pour ${topic.toLowerCase()} ?`,
      options: ["Le produit le plus populaire", "Le besoin réel", "Le plus gros rabais", "La marque la plus connue"],
      correct: 1,
      explanation: `Dans ${context}, la décision doit commencer par le besoin réel et les contraintes concrètes.`,
    },
    {
      q: "Quel est le bon réflexe face à une information floue ?",
      options: ["Acheter vite", "Augmenter la vigilance", "Ignorer le manque", "Comparer seulement le prix"],
      correct: 1,
      explanation: "Une donnée floue ou absente doit ralentir la décision, pas l’accélérer.",
    },
    {
      q: "Quel nombre de critères non négociables est généralement suffisant ?",
      options: ["1", "2 ou 3", "6 ou 7", "Le plus possible"],
      correct: 1,
      explanation: "Deux ou trois critères forts cadrent bien l’achat sans rigidifier inutilement la comparaison.",
    },
    {
      q: "Pourquoi faut-il éviter de comparer trop de références en même temps ?",
      options: ["Parce que c’est interdit", "Parce que le bruit augmente", "Parce que le score baisse", "Parce que Mimo ne suit pas"],
      correct: 1,
      explanation: "Au-delà de 2 ou 3 références proches, la comparaison perd en lisibilité et les compromis deviennent moins clairs.",
    },
    {
      q: "Une promo suffit-elle à prouver qu’une offre est intéressante ?",
      options: ["Oui", "Non"],
      correct: 1,
      explanation: "Une promo attire l’attention, mais elle ne prouve ni la pertinence ni la qualité globale de l’offre.",
    },
    {
      q: "Quel est le meilleur usage d’un projet MAREF ?",
      options: ["Stocker des liens", "Structurer une décision", "Afficher des badges", "Remplacer la comparaison"],
      correct: 1,
      explanation: "Le projet sert à cadrer un objectif, un budget, une famille et une short-list cohérente.",
    },
    {
      q: "Quand une fiche est très riche en marketing mais pauvre en données, il faut :",
      options: ["Faire confiance au marketing", "Considérer cela comme un signal de risque", "Acheter avant la rupture", "L’ajouter en favoris sans réfléchir"],
      correct: 1,
      explanation: "Une belle mise en scène ne remplace jamais une information fiable et exploitable.",
    },
    {
      q: "Le meilleur choix est toujours le moins cher.",
      options: ["Vrai", "Faux"],
      correct: 1,
      explanation: "Le meilleur choix dépend du besoin, du risque accepté, du budget, du contexte et de la durée d’usage.",
    },
    {
      q: "Quel est le rôle principal de Mimo ?",
      options: ["Faire du marketing", "Rendre la décision plus intelligible", "Remplacer toutes les données", "Choisir à votre place sans contexte"],
      correct: 1,
      explanation: "Mimo aide à interpréter, cadrer, comparer et signaler les limites de l’information disponible.",
    },
    {
      q: "Quel est le bon signe d’une décision solide ?",
      options: ["Elle est impulsive", "Elle peut s’expliquer simplement", "Elle suit la tendance", "Elle ignore les compromis"],
      correct: 1,
      explanation: "Une bonne décision peut être expliquée clairement : pourquoi cette option, pour quel usage, avec quels compromis.",
    },
  ];
}

function getLessonDeepening(categoryId: string) {
  if (categoryId === "choisir") {
    return `Dans la pratique, cela veut dire qu'il faut toujours partir de votre usage réel, de vos contraintes d'espace, de votre fréquence d'utilisation et de votre horizon de conservation avant de laisser le marketing orienter la décision. Une bonne méthode de choix réduit les regrets après achat, car elle transforme des spécifications abstraites en conséquences très concrètes dans le quotidien.`;
  }

  if (categoryId === "offre") {
    return `Le bon réflexe consiste à relier chaque élément de l'offre à un niveau de risque ou de confort : clarté de la garantie, sérieux de l'enseigne, lisibilité des conditions et fiabilité des informations techniques. Plus une fiche ou un marchand restent flous, plus il faut ralentir et exiger des signaux vérifiables avant d'avancer.`;
  }

  return `L'objectif n'est pas d'accumuler des critères, mais d'identifier ceux qui changent vraiment l'arbitrage final. Une comparaison utile doit rendre visibles les compromis, permettre d'expliquer le choix retenu et montrer pourquoi une option devient meilleure qu'une autre dans un contexte réel.`;
}

function getLessonAction(lessonTitle: string) {
  return `Après cette leçon, vous devez pouvoir reformuler simplement ce que "${lessonTitle}" change dans une vraie décision d'achat, puis vérifier si ces critères sont bien visibles dans MAREF avant de comparer ou de trancher.`;
}

export const GUIDE_MODULES: GuideModule[] = [
  {
    id: "choose-washing-machine",
    categoryId: "choisir",
    title: "Comment choisir son lave-linge",
    desc: "Capacité, bruit, dimensions, confort et usage réel.",
    duration: "12 min",
    difficulty: "Essentiel",
    icon: "🧺",
    content: [
      { title: "Commencer par le foyer", body: "Le volume de linge, la fréquence des cycles et la composition du foyer sont les premiers critères. Une capacité mal calibrée crée vite de la frustration ou du surcoût inutile." },
      { title: "Valider les contraintes physiques", body: "Dimensions, profondeur, ouverture de porte, accès à la pièce et niveau sonore doivent être vérifiés avant toute comparaison plus fine." },
      { title: "Lire les critères utiles", body: "Capacité, essorage, bruit, lisibilité des programmes, qualité perçue et garantie ont plus d’impact réel que beaucoup de promesses marketing." },
      { title: "Arbitrer correctement", body: "Le bon choix est celui qui reste cohérent avec votre usage sur plusieurs années, pas forcément celui qui gagne la guerre du prix affiché." },
    ],
  },
  {
    id: "choose-dryer",
    categoryId: "choisir",
    title: "Comment choisir son sèche-linge",
    desc: "Technologie, bruit, temps de cycle et cohérence avec le lave-linge.",
    duration: "10 min",
    difficulty: "Essentiel",
    icon: "🌬️",
    content: [
      { title: "Partir du rythme réel", body: "Le bon sèche-linge dépend du nombre de cycles hebdomadaires, du type de linge, du temps disponible et de votre tolérance au bruit." },
      { title: "Relier la technologie à l’usage", body: "La technologie n’a de sens que si elle améliore vraiment le confort, le coût global ou la simplicité d’entretien dans votre quotidien." },
      { title: "Vérifier la capacité", body: "La capacité doit rester cohérente avec le lave-linge actuel ou envisagé, sinon l’usage devient vite déséquilibré." },
      { title: "Éviter le faux bon plan", body: "Une offre agressive n’est pas forcément une bonne décision si elle est mal garantie, mal documentée ou peu cohérente avec votre usage." },
    ],
  },
  {
    id: "choose-refrigerator",
    categoryId: "choisir",
    title: "Comment choisir son réfrigérateur",
    desc: "Volume utile, format, bruit, froid ventilé et contraintes d’espace.",
    duration: "11 min",
    difficulty: "Essentiel",
    icon: "🧊",
    content: [
      { title: "Choisir le bon format", body: "Top, 1 porte, combiné, multi-door ou américain : le bon format dépend de la place, du foyer et des habitudes de courses." },
      { title: "Lire le volume utile", body: "Le volume doit être dimensionné selon l’usage réel et non selon une logique de suréquipement. Trop grand peut devenir un mauvais arbitrage." },
      { title: "Regarder le bruit et l’intégration", body: "Le niveau sonore et l’intégration dans la cuisine ont un impact quotidien fort, surtout dans les logements compacts ou ouverts." },
      { title: "Vérifier les vrais signaux", body: "Garantie, lisibilité des données, cohérence de l’offre et qualité perçue restent déterminants à côté des specs pures." },
    ],
  },
  {
    id: "choose-screen-device",
    categoryId: "choisir",
    title: "Comment choisir un téléphone, une tablette ou un PC",
    desc: "Traduire les spécifications en impact concret.",
    duration: "14 min",
    difficulty: "Intermédiaire",
    icon: "💻",
    content: [
      { title: "Commencer par les usages dominants", body: "Autonomie, bureautique, photo, jeu, création, mobilité ou confort visuel : le besoin doit précéder la fiche technique." },
      { title: "Séparer les specs structurantes", body: "Mémoire, stockage, écran, autonomie et suivi logiciel comptent souvent plus que des promesses spectaculaires mal contextualisées." },
      { title: "Lire le prix avec l’horizon", body: "Un appareil un peu plus cher peut devenir meilleur s’il reste confortable plus longtemps et s’il est mieux supporté." },
      { title: "Éviter la prime de marque automatique", body: "L’écosystème a de la valeur s’il apporte un vrai confort. Sinon, il peut surtout augmenter la facture." },
    ],
  },
  {
    id: "understand-price-market",
    categoryId: "offre",
    title: "Comprendre les prix et le marché",
    desc: "Lire une offre au-delà du prix barré ou du badge promo.",
    duration: "10 min",
    difficulty: "Essentiel",
    icon: "💶",
    content: [
      { title: "Le prix seul ne suffit pas", body: "Un prix n’explique ni la pertinence du produit, ni le risque marchand, ni la qualité globale de la décision." },
      { title: "Le prix barré n’est pas une preuve", body: "Une promo doit être replacée dans un contexte : besoin, cadre marchand, niveau d’information et qualité réelle de l’offre." },
      { title: "Le marché est fragmenté", body: "Deux offres proches en prix peuvent être très différentes sur la livraison, la garantie, la lisibilité ou la confiance marchande." },
      { title: "Le manque d’information est déjà un signal", body: "Une fiche floue doit faire monter la vigilance, surtout sur les dimensions, la garantie, la disponibilité et les conditions de retour." },
    ],
  },
  {
    id: "understand-product-sheet",
    categoryId: "offre",
    title: "Comprendre une fiche produit",
    desc: "Faire parler une fiche technique sans se laisser entraîner par le marketing.",
    duration: "11 min",
    difficulty: "Essentiel",
    icon: "🧾",
    content: [
      { title: "Le nom commercial ne suffit pas", body: "Ce qui compte, ce sont les données qui changent l’usage : dimensions, autonomie, bruit, mémoire, capacité, garantie ou connectique." },
      { title: "Transformer une spec en impact", body: "Une donnée utile doit être traduite en conséquence réelle : confort, place, durée, risque, simplicité ou coût sur la durée." },
      { title: "Repérer les signaux faibles", body: "Une fiche complète, stable et claire inspire une autre confiance qu’une fiche approximative, même si le prix paraît séduisant." },
      { title: "Utiliser Mimo au bon niveau", body: "Mimo sert à éclairer la lecture, à nommer les manques et à reformuler les compromis, pas à maquiller les zones grises." },
    ],
  },
  {
    id: "understand-merchant-risk",
    categoryId: "offre",
    title: "Comprendre l’enseigne et le risque marchand",
    desc: "Lire le vendeur, la garantie, la livraison et le retour comme de vrais critères.",
    duration: "9 min",
    difficulty: "Intermédiaire",
    icon: "🏬",
    content: [
      { title: "Un achat ne se limite pas au produit", body: "Le vendeur, la garantie, la clarté du retour et la qualité de la livraison influencent directement la sécurité de votre achat." },
      { title: "Ce qu’il faut vérifier", body: "Conditions de retour, visibilité du SAV, clarté de la disponibilité, qualité de l’information et cohérence du discours commercial." },
      { title: "Quand ralentir", body: "Si l’enseigne est floue, si les conditions sont peu lisibles ou si les promesses sont trop agressives, il faut ralentir." },
      { title: "Comment MAREF lit ce risque", body: "L’axe Assurance sert justement à objectiver cette confiance marchande au lieu de la laisser au ressenti." },
    ],
  },
  {
    id: "compare-shortlist",
    categoryId: "comparaison",
    title: "Comparer 2 ou 3 offres sans se perdre",
    desc: "Construire une short-list claire et utile.",
    duration: "12 min",
    difficulty: "Intermédiaire",
    icon: "⚖️",
    content: [
      { title: "Pourquoi 3 offres maximum", body: "Au-delà de trois offres comparables, la décision devient plus bruyante et les écarts utiles se lisent moins bien." },
      { title: "Lire d’abord les axes", body: "La première lecture doit porter sur PEFAS, puis sur les données techniques qui expliquent les écarts observés." },
      { title: "Comparer les bonnes données", body: "Seules les données qui changent vraiment la décision doivent rester visibles : dimensions, bruit, mémoire, autonomie, garantie, technologie ou cadre marchand." },
      { title: "Savoir trancher", body: "Une bonne décision doit pouvoir se résumer en une phrase claire : pourquoi cette offre l’emporte, avec quels compromis." },
    ],
  },
  {
    id: "read-score-pefas",
    categoryId: "comparaison",
    title: "Comprendre le score MAREF et PEFAS",
    desc: "Lire la note globale sans perdre les nuances.",
    duration: "10 min",
    difficulty: "Intermédiaire",
    icon: "📊",
    content: [
      { title: "Le score n’est pas une vérité absolue", body: "Le score résume une lecture, mais il ne doit jamais écraser le contexte, les objectifs ni les contraintes réelles." },
      { title: "PEFAS avant la note finale", body: "La note globale est utile si vous comprenez les axes qui la composent : pertinence, économie, fluidité, assurance, stabilité." },
      { title: "Une bonne note peut cacher un vrai compromis", body: "Une offre peut être forte globalement mais faible sur un axe qui compte beaucoup pour vous. C’est là que la lecture détaillée devient utile." },
      { title: "Le projet change la lecture", body: "Un score contextualisé dans un projet peut être plus utile qu’une note globale isolée, car il tient compte du besoin réel." },
    ],
  },
  {
    id: "decide-with-confidence",
    categoryId: "comparaison",
    title: "Décider avec confiance",
    desc: "Transformer une short-list en décision assumée.",
    duration: "8 min",
    difficulty: "Intermédiaire",
    icon: "✅",
    content: [
      { title: "Savoir quand la décision est mûre", body: "Une décision devient mûre quand les critères clés sont clairs, les offres lisibles et les compromis compris." },
      { title: "Ne pas chercher la perfection", body: "Le bon achat n’est pas parfait. C’est celui qui est le plus cohérent avec le besoin, le budget et le niveau de risque accepté." },
      { title: "Assumer le compromis", body: "Choisir, c’est accepter qu’une option perde sur certains points pour gagner sur ceux qui comptent vraiment." },
      { title: "Faire de MAREF un réflexe", body: "Le vrai réflexe utile, c’est de cadrer, comparer, vérifier, puis trancher. Plus vous répétez ce schéma, plus la décision devient fluide." },
    ],
  },
].map((module) => ({
  ...module,
  content: module.content.map((lesson) => ({
    ...lesson,
    body: `${lesson.body} ${getLessonDeepening(module.categoryId)} ${getLessonAction(lesson.title)}`,
  })),
}));

export const GUIDE_QUIZZES: GuideQuiz[] = GUIDE_MODULES.map((module) => ({
  id: `quiz-${module.id}`,
  categoryId: module.categoryId,
  moduleId: module.id,
  title: `Quiz : ${module.title}`,
  description: `10 questions pour vérifier si vous maîtrisez les fondamentaux du module « ${module.title} ».`,
  questions: createQuestions(module.title, module.desc),
}));
