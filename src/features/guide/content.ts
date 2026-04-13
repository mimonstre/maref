import { CATEGORIES } from "@/lib/categories";

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
    description: "Des modules par sous-catégorie pour cadrer le besoin, filtrer les critères utiles et éviter les comparaisons confuses.",
    icon: "🎯",
  },
  {
    id: "offre",
    title: "Comprendre une offre",
    description: "Lire un prix, une fiche, un marchand, une garantie et un niveau de risque sans se faire guider par le décor.",
    icon: "🔎",
  },
  {
    id: "comparaison",
    title: "Comparer et décider",
    description: "Construire une shortlist, lire les écarts, comprendre le score et prendre une décision plus défendable.",
    icon: "⚖️",
  },
];

function lessonBody(intro: string, practical: string, decision: string) {
  return `${intro}\n\n${practical}\n\n${decision}`;
}

function createQuiz(topic: string, context: string): GuideQuiz["questions"] {
  return [
    {
      q: `Quel est le bon point de départ pour ${topic.toLowerCase()} ?`,
      options: ["Le prix barré", "Le besoin réel", "La marque la plus connue", "Le produit le plus populaire"],
      correct: 1,
      explanation: `Dans ${context}, la méthode doit partir du besoin réel et non d’un signal marketing isolé.`,
    },
    {
      q: "Quel est le bon réflexe quand une donnée utile manque ?",
      options: ["Acheter vite", "L’ignorer", "Dire que la comparaison devient partielle", "Suivre le score sans poser de question"],
      correct: 2,
      explanation: "Une comparaison honnête doit signaler explicitement ce qui manque au lieu de combler le vide avec une impression.",
    },
    {
      q: "Pourquoi faut-il limiter la shortlist à 2 ou 3 options proches ?",
      options: ["Parce que l’outil l’impose", "Parce que la lisibilité baisse vite au-delà", "Parce que le score MAREF disparaît", "Parce que les prix deviennent faux"],
      correct: 1,
      explanation: "Au-delà de 2 ou 3 options comparables, le bruit augmente et les écarts vraiment utiles deviennent moins lisibles.",
    },
    {
      q: "Une offre très attractive sur le prix mais pauvre en informations doit plutôt :",
      options: ["Être privilégiée immédiatement", "Être considérée comme plus sûre", "Être regardée avec plus de vigilance", "Être ajoutée d’office au projet"],
      correct: 2,
      explanation: "Une donnée floue n’est pas neutre. Elle augmente le risque de mauvaise décision.",
    },
    {
      q: "Le meilleur choix est toujours le moins cher.",
      options: ["Vrai", "Faux"],
      correct: 1,
      explanation: "Le meilleur choix dépend du besoin, du marchand, du coût d’erreur, de la durée d’usage et des critères non négociables.",
    },
    {
      q: "À quoi sert un projet MAREF ?",
      options: ["À stocker des liens sans méthode", "À structurer une décision concrète", "À afficher plus de badges", "À remplacer l’explorer"],
      correct: 1,
      explanation: "Le projet relie objectif, budget, références et comparaison. C’est le cadre de la décision, pas un simple dossier.",
    },
    {
      q: "Quand une fiche est très marketing mais techniquement floue, la bonne posture est :",
      options: ["Faire confiance au ton", "Ralentir la décision", "Acheter avant rupture", "Ignorer la fiche"],
      correct: 1,
      explanation: "Une présentation séduisante ne remplace jamais des informations utiles, stables et comparables.",
    },
    {
      q: "Quel est le rôle principal de Mimo ?",
      options: ["Vendre une marque", "Rendre la décision plus intelligible", "Remplacer toutes les données", "Choisir seul à votre place"],
      correct: 1,
      explanation: "Mimo sert à éclairer, reformuler, hiérarchiser et signaler les limites d’une décision.",
    },
    {
      q: "Quel est le signe d’une décision solide ?",
      options: ["Elle est impulsive", "Elle suit la mode", "Elle peut s’expliquer simplement", "Elle évite tous les compromis"],
      correct: 2,
      explanation: "Une bonne décision peut être résumée clairement : pourquoi cette option, pour quel usage et avec quels compromis assumés.",
    },
    {
      q: "Quel est le bon usage du guide ?",
      options: ["Lire en diagonale pour aller plus vite", "Le consulter juste avant un vrai achat ou une vraie comparaison", "Le traiter comme un blog", "Le remplacer par des intuitions"],
      correct: 1,
      explanation: "Le guide devient utile quand il renforce une décision réelle, pas quand il reste séparé de l’usage.",
    },
  ];
}

function createChoosingLessons(subcategoryName: string, familyName: string): GuideLesson[] {
  return [
    {
      title: `Cadrer le besoin avant de regarder ${subcategoryName.toLowerCase()}`,
      body: lessonBody(
        `Le bon point de départ pour ${subcategoryName.toLowerCase()} n'est jamais la fiche la plus séduisante. Il faut d'abord clarifier l'usage, les contraintes du logement, le niveau d'exigence et le niveau de risque acceptable. Dans ${familyName.toLowerCase()}, cette étape évite de comparer des références qui n'ont en réalité rien à faire dans la même shortlist.`,
        `Posez quatre questions simples : quel usage principal doit être couvert, quelle contrainte est non négociable, quel compromis reste acceptable et quel horizon de conservation vous visez. Une fois ce cadre posé, les caractéristiques techniques reprennent leur vraie fonction : aider à décider, pas occuper l'écran.`,
        `Quand MAREF devient utile, c'est précisément à ce moment : traduire un besoin flou en arbitrage lisible pour ne garder que quelques options vraiment crédibles.`
      ),
    },
    {
      title: "Identifier les critères qui changent vraiment la décision",
      body: lessonBody(
        `Toutes les caractéristiques n'ont pas le même poids. Pour ${subcategoryName.toLowerCase()}, certaines données changent directement le confort, la pertinence ou le risque d'erreur, alors que d'autres relèvent surtout du décor marketing.`,
        `Le bon réflexe consiste à relier chaque ligne technique à une conséquence concrète : plus simple à vivre, plus cohérent avec le foyer, plus robuste, plus silencieux, plus compact, plus rassurant ou simplement plus cher sans bénéfice clair. Cette traduction évite de se laisser guider par l'accumulation de chiffres.`,
        `Une fiche utile est donc une fiche qui permet d'expliquer le choix final. Si une donnée ne vous aide ni à éliminer ni à départager, elle ne doit pas dominer la comparaison.`
      ),
    },
    {
      title: "Construire une shortlist exploitable",
      body: lessonBody(
        `Une bonne shortlist pour ${subcategoryName.toLowerCase()} contient peu d'options, mais de bonnes options. L'objectif n'est pas de collectionner des références. L'objectif est de faire apparaître des arbitrages lisibles entre deux ou trois directions plausibles.`,
        `Une option peut rester dans la shortlist parce qu'elle est la plus économique, la plus équilibrée, la plus robuste ou la plus rassurante côté marchand. Tant que cette raison n'est pas claire, la référence ajoute du bruit plutôt que de la valeur.`,
        `C'est cette discipline qui rend ensuite le comparateur vraiment utile : on compare enfin des options rivales, et non un mélange d'objets mal cadrés.`
      ),
    },
    {
      title: "Assumer le bon compromis final",
      body: lessonBody(
        `Choisir ${subcategoryName.toLowerCase()}, ce n'est pas trouver l'objet parfait. C'est choisir la référence dont les compromis restent les plus acceptables pour votre contexte réel.`,
        `Une bonne décision s'exprime simplement : pourquoi cette option, pour quel usage, avec quel niveau de confiance, et quels renoncements assumés. Si vous pouvez expliquer cela sans effort, la décision est déjà beaucoup plus solide.`,
        `L'objectif du guide n'est pas d'ajouter du texte. Il est de vous faire gagner en clarté quand vous reviendrez dans l'explorer, les projets et le comparateur.`
      ),
    },
  ];
}

function createOfferLessons(topic: string, angle: string): GuideLesson[] {
  return [
    {
      title: "Lire l'offre comme un cadre marchand complet",
      body: lessonBody(
        `Une offre ne se résume pas à un prix. Pour ${topic.toLowerCase()}, il faut lire le vendeur, la structure de la promesse, les conditions visibles et le niveau de clarté globale.`,
        `Le bon réflexe est de regarder ce que l'offre vous permet réellement de comprendre : qui vend, à quel niveau de lisibilité, avec quelle garantie apparente et quelle qualité de présentation.`,
        `Plus la lecture est claire, plus la décision peut être assumée. Plus la fiche est floue, plus le risque augmente.`
      ),
    },
    {
      title: "Éviter les faux signaux de confiance",
      body: lessonBody(
        `Une réduction, une mise en avant ou un ton commercial fort ne valent pas preuve de qualité. ${angle}`,
        `Le bon niveau d'analyse consiste à séparer ce qui est prouvé, ce qui est seulement suggéré et ce qui manque encore.`,
        `Une décision propre sait ralentir quand l'offre pousse à aller trop vite.`
      ),
    },
    {
      title: "Relier l'offre à un vrai coût d'erreur",
      body: lessonBody(
        `Certaines offres semblent proches jusqu'au moment où un détail marchand ou produit change totalement le risque : retour difficile, livraison floue, données incomplètes ou garantie ambiguë.`,
        `Le bon usage de MAREF est précisément de rendre ces détails visibles au bon moment pour éviter de comparer seulement des chiffres.`,
        `Une offre fiable n'est pas seulement attractive. Elle reste défendable.`
      ),
    },
    {
      title: "Décider si l'offre mérite d'entrer en shortlist",
      body: lessonBody(
        `La bonne question n'est pas "est-ce une offre séduisante ?", mais "mérite-t-elle de rester dans le parcours de décision ?".`,
        `Une offre utile peut être moins spectaculaire, mais plus claire, plus rassurante et plus cohérente avec votre contexte.`,
        `Une shortlist solide se construit sur des offres explicables, pas sur des signaux agressifs.`
      ),
    },
  ];
}

function createComparisonLessons(topic: string): GuideLesson[] {
  return [
    {
      title: "Réduire le bruit avant de comparer",
      body: lessonBody(
        `La comparaison devient utile quand les options en présence répondent au même sujet. Pour ${topic.toLowerCase()}, le premier travail n'est donc pas de lire les scores, mais de s'assurer que les références sont vraiment comparables.`,
        `Une comparaison surchargée donne une illusion de profondeur tout en rendant la décision plus difficile. Deux ou trois options bien choisies suffisent presque toujours à faire apparaître les vrais écarts.`,
        `MAREF est le plus fort quand il sert à arbitrer proprement, pas quand il accumule des cartes.`
      ),
    },
    {
      title: "Lire les axes et pas seulement la note",
      body: lessonBody(
        `Une note globale aide à aller vite, mais elle ne dit pas tout. Les axes PEFAS montrent où une offre est forte, où elle reste fragile et pourquoi elle peut tout de même être pertinente dans un contexte donné.`,
        `Le bon réflexe consiste à lire la note comme une entrée, puis les axes comme l'explication réelle de la décision.`,
        `C'est souvent là que les arbitrages deviennent enfin clairs.`
      ),
    },
    {
      title: "Formuler les compromis",
      body: lessonBody(
        `Une comparaison n'a de valeur que si elle aide à nommer les compromis. L'offre la plus rassurante n'est pas toujours la moins chère. L'offre la plus économique n'est pas toujours celle qui coûte le moins cher à assumer.`,
        `En sortant de la comparaison, vous devez pouvoir résumer ce que chaque option gagne et ce qu'elle fait perdre.`,
        `Une bonne décision n'efface pas les compromis. Elle choisit les bons.`
      ),
    },
    {
      title: "Savoir quand trancher",
      body: lessonBody(
        `La décision devient mûre quand vous savez expliquer simplement pourquoi une offre l'emporte dans votre contexte.`,
        `Ce moment n'arrive pas quand tous les doutes disparaissent, mais quand les doutes restants sont compris et assumés.`,
        `C'est exactement la promesse du comparateur MAREF : rendre une décision plus lisible, pas l'automatiser de force.`
      ),
    },
  ];
}

const choosingSubcategoryModules: GuideModule[] = CATEGORIES.flatMap((category) =>
  category.subs.map((subcategory) => ({
    id: `choose-${subcategory.id}`,
    categoryId: "choisir",
    title: `Comment choisir ${subcategory.name.toLowerCase()}`,
    desc: `Méthode claire pour cadrer le besoin, filtrer les critères utiles et comparer ${subcategory.name.toLowerCase()} sans bruit inutile.`,
    duration: "12 min",
    difficulty: "Essentiel",
    icon: subcategory.icon,
    content: createChoosingLessons(subcategory.name, category.name),
  })),
);

const offerModules: GuideModule[] = [
  {
    id: "understand-prices",
    categoryId: "offre",
    title: "Comprendre les prix et le marché",
    desc: "Lire au-delà du prix barré, de l'urgence promo et des écarts qui paraissent évidents.",
    duration: "11 min",
    difficulty: "Essentiel",
    icon: "💶",
    content: createOfferLessons(
      "les prix et le marché",
      "Le prix ne doit jamais écraser la lecture du marchand, de la structure de l'offre et du niveau de confiance réel."
    ),
  },
  {
    id: "understand-product-sheet",
    categoryId: "offre",
    title: "Comprendre une fiche produit",
    desc: "Faire parler les caractéristiques utiles sans se faire noyer par le décor technique.",
    duration: "12 min",
    difficulty: "Essentiel",
    icon: "🧾",
    content: createOfferLessons(
      "une fiche produit",
      "Une fiche riche n'est pas forcément une fiche utile si elle ne vous aide pas à relier les specs à une conséquence d'usage."
    ),
  },
  {
    id: "understand-merchant-risk",
    categoryId: "offre",
    title: "Comprendre le risque marchand",
    desc: "Lire la garantie, la livraison, le retour et la lisibilité du vendeur comme de vrais critères.",
    duration: "10 min",
    difficulty: "Intermédiaire",
    icon: "🏬",
    content: createOfferLessons(
      "le risque marchand",
      "Le vendeur fait partie de l'offre. La qualité du cadre marchand change souvent plus la décision qu'un petit écart de prix."
    ),
  },
  {
    id: "decode-promotions",
    categoryId: "offre",
    title: "Décoder une promotion",
    desc: "Séparer la vraie opportunité du simple habillage commercial.",
    duration: "10 min",
    difficulty: "Essentiel",
    icon: "🏷️",
    content: createOfferLessons(
      "une promotion",
      "Une promo n'est intéressante que si l'offre reste cohérente sans l'habillage promotionnel."
    ),
  },
];

const comparisonModules: GuideModule[] = [
  {
    id: "build-shortlist",
    categoryId: "comparaison",
    title: "Construire une shortlist utile",
    desc: "Réduire le bruit avant de comparer en profondeur.",
    duration: "12 min",
    difficulty: "Intermédiaire",
    icon: "📌",
    content: createComparisonLessons("la shortlist"),
  },
  {
    id: "read-score-pefas",
    categoryId: "comparaison",
    title: "Lire le score MAREF et PEFAS",
    desc: "Comprendre ce que la note dit vraiment, et ce qu'elle ne dit pas.",
    duration: "11 min",
    difficulty: "Intermédiaire",
    icon: "📊",
    content: createComparisonLessons("le score MAREF et PEFAS"),
  },
  {
    id: "decide-with-confidence",
    categoryId: "comparaison",
    title: "Décider avec confiance",
    desc: "Transformer une comparaison en décision assumée.",
    duration: "10 min",
    difficulty: "Intermédiaire",
    icon: "✅",
    content: createComparisonLessons("la décision finale"),
  },
  {
    id: "project-arbitrage",
    categoryId: "comparaison",
    title: "Arbitrer dans un projet",
    desc: "Lire une offre dans un contexte d'objectif, de budget et de shortlist réelle.",
    duration: "13 min",
    difficulty: "Intermédiaire",
    icon: "🗂️",
    content: createComparisonLessons("l'arbitrage projet"),
  },
];

export const GUIDE_MODULES: GuideModule[] = [
  ...choosingSubcategoryModules,
  ...offerModules,
  ...comparisonModules,
];

export const GUIDE_QUIZZES: GuideQuiz[] = GUIDE_MODULES.map((module) => ({
  id: `quiz-${module.id}`,
  categoryId: module.categoryId,
  moduleId: module.id,
  title: `Quiz : ${module.title}`,
  description: `10 questions pour vérifier si vous maîtrisez les réflexes clés du module « ${module.title} ».`,
  questions: createQuiz(module.title, module.desc),
}));
