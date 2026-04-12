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
    description: "Apprendre à cadrer un besoin et choisir le bon appareil selon le contexte réel.",
    icon: "🎯",
  },
  {
    id: "offre",
    title: "Comprendre une offre",
    description: "Lire un prix, une fiche produit, un marchand et un cadre de vente sans se faire piéger.",
    icon: "🔎",
  },
  {
    id: "comparaison",
    title: "Comparer et décider",
    description: "Construire une vraie short-list, lire PEFAS et arbitrer proprement entre 2 ou 3 références.",
    icon: "⚖️",
  },
];

export const GUIDE_MODULES: GuideModule[] = [
  {
    id: "choose-washing-machine",
    categoryId: "choisir",
    title: "Comment choisir son lave-linge",
    desc: "Capacité, bruit, place, usage : les critères qui changent vraiment la décision.",
    duration: "10 min",
    difficulty: "Essentiel",
    icon: "🧺",
    content: [
      {
        title: "Commencer par le foyer et le rythme réel",
        body:
          "Le bon lave-linge dépend d'abord du foyer, du volume de linge et du rythme des cycles. Une petite machine peut être parfaite pour une personne seule, mais devenir vite limitante pour une famille. À l'inverse, surdimensionner l'appareil augmente souvent le prix, l'encombrement et parfois la consommation sans bénéfice réel.",
      },
      {
        title: "Vérifier les contraintes physiques",
        body:
          "Avant même de comparer les références, il faut valider les dimensions, l'ouverture, l'accès, le passage dans le logement et le niveau sonore acceptable. Beaucoup de mauvais achats viennent d'un produit techniquement bon mais mal adapté à la pièce ou au mode de vie.",
      },
      {
        title: "Lire les critères vraiment utiles",
        body:
          "Les critères qui font la différence sont surtout la capacité, le bruit, la qualité d'essorage, la lisibilité des programmes et la cohérence générale de l'offre. Le marketing met souvent en avant des fonctions secondaires alors que la vraie vie se joue sur le confort au quotidien.",
      },
      {
        title: "Arbitrer prix, confort et durée",
        body:
          "Le bon arbitrage ne consiste pas à acheter le moins cher. Il consiste à trouver le point d'équilibre entre budget, usage et horizon de conservation. Si vous comptez garder votre appareil plusieurs années, la qualité d'information, la garantie et la sensation de robustesse deviennent bien plus importantes.",
      },
    ],
  },
  {
    id: "choose-dryer",
    categoryId: "choisir",
    title: "Comment choisir son sèche-linge",
    desc: "Technologie, bruit, capacité et temps de cycle : les vrais points de décision.",
    duration: "9 min",
    difficulty: "Essentiel",
    icon: "🌬️",
    content: [
      {
        title: "Commencer par l'usage",
        body:
          "Le besoin n'est pas le même selon qu'on sèche ponctuellement ou plusieurs fois par semaine. La technologie n'a de sens qu'en lien avec le rythme réel, le type de linge, l'espace disponible et la tolérance au bruit.",
      },
      {
        title: "Regarder la technologie avec recul",
        body:
          "Pompe à chaleur, condensation classique ou autres variantes : l'essentiel est de comprendre l'impact concret sur le temps de cycle, le confort, le coût global et l'entretien. Une promesse technique isolée ne suffit pas à qualifier une bonne offre.",
      },
      {
        title: "Lire la capacité et le temps réel",
        body:
          "La capacité affichée doit être cohérente avec le lave-linge déjà présent ou le projet d'équipement. Le temps de séchage et la régularité d'usage comptent autant que l'étiquette du produit.",
      },
      {
        title: "Éviter les faux bons plans",
        body:
          "Un sèche-linge à prix agressif peut être moins pertinent s'il est peu lisible, mal garanti ou peu cohérent avec l'usage visé. Dans MAREF, on compare d'abord la pertinence puis les compromis, pas seulement l'étiquette de prix.",
      },
    ],
  },
  {
    id: "choose-phone-pc",
    categoryId: "choisir",
    title: "Comment choisir un téléphone, une tablette ou un PC",
    desc: "Séparer les specs importantes du bruit marketing en téléphonie et informatique.",
    duration: "12 min",
    difficulty: "Intermédiaire",
    icon: "💻",
    content: [
      {
        title: "Partir des usages dominants",
        body:
          "Pour un smartphone, une tablette ou un PC, il faut commencer par les usages dominants : autonomie, photo, fluidité, bureautique, étude, création, jeu ou simplicité. Une fiche technique impressionnante ne vaut rien si elle ne sert pas le besoin principal.",
      },
      {
        title: "Identifier les composants structurants",
        body:
          "Il faut distinguer les composants décisifs des détails décoratifs. Sur un PC, mémoire vive, stockage, écran et autonomie sont souvent plus utiles à lire que certaines promesses de performance théorique. Sur un téléphone, autonomie, stockage, suivi logiciel et photo comptent souvent davantage que la seule fiche brute.",
      },
      {
        title: "Lire le prix avec l'horizon d'usage",
        body:
          "Un appareil un peu plus cher peut devenir meilleur s'il est gardé plus longtemps, mieux supporté ou mieux adapté à l'usage. MAREF doit vous aider à voir si la valeur ajoutée est réelle ou purement symbolique.",
      },
      {
        title: "Ne pas surpayer l'écosystème sans raison",
        body:
          "L'écosystème a de la valeur quand il simplifie réellement la vie : synchronisation, accessoires, support, continuité d'usage. S'il n'apporte rien de concret, il devient juste une prime de marque.",
      },
    ],
  },
  {
    id: "understand-price-and-market",
    categoryId: "offre",
    title: "Comprendre les prix, le marché et les faux repères",
    desc: "Lire une offre au-delà du prix barré et du discours commercial.",
    duration: "11 min",
    difficulty: "Essentiel",
    icon: "💶",
    content: [
      {
        title: "Le prix affiché ne suffit jamais",
        body:
          "Un prix seul ne dit ni si l'offre est juste, ni si le produit est adapté, ni si le cadre de vente est propre. Une bonne décision commence par la lecture conjointe du besoin, de la qualité de l'offre et du niveau de risque accepté.",
      },
      {
        title: "Pourquoi les prix barrés trompent souvent",
        body:
          "Le prix barré attire l'œil, mais il ne démontre pas une bonne affaire. Il faut toujours se demander si le produit aurait mérité votre attention sans l'effet promo. Si la réponse est non, la promotion ne doit pas piloter la décision.",
      },
      {
        title: "Le marché ne se lit pas en un clic",
        body:
          "Le marché est fragmenté : qualité de fiche, marchand, disponibilité, image de marque et densité d'information changent beaucoup la perception. MAREF aide à remettre tout cela dans une lecture commune pour éviter les comparaisons bancales.",
      },
      {
        title: "Quand le manque d'information est un signal",
        body:
          "Une offre floue sur les specs, la garantie, la livraison ou les conditions de retour doit immédiatement augmenter la vigilance. L'absence d'information n'est pas neutre : c'est déjà un risque à lire.",
      },
    ],
  },
  {
    id: "understand-product-sheet",
    categoryId: "offre",
    title: "Comprendre une fiche produit sans se faire influencer",
    desc: "Traduire les données en impact concret plutôt qu'en impression marketing.",
    duration: "10 min",
    difficulty: "Essentiel",
    icon: "🧾",
    content: [
      {
        title: "Le nom commercial n'est pas la vérité",
        body:
          "Les intitulés produit sont faits pour séduire, pas pour vous aider à arbitrer. Ce qui compte, ce sont les données qui changent l'usage réel : dimensions, capacité, autonomie, connectique, garantie, bruit, mémoire, etc.",
      },
      {
        title: "Traduire la spec en impact",
        body:
          "Une bonne lecture consiste à transformer une donnée en conséquence concrète. Un niveau sonore élevé signifie un usage plus pénible. Une faible mémoire signifie une durée de confort plus courte. Une grande capacité signifie un meilleur ajustement à certains foyers.",
      },
      {
        title: "Repérer les signaux faibles",
        body:
          "Il faut regarder la cohérence de la fiche dans son ensemble : richesse des données, lisibilité marchande, qualité du cadre de vente, logique du prix, stabilité perçue. Une fiche complète inspire une autre confiance qu'une fiche approximative.",
      },
      {
        title: "Utiliser Mimo correctement",
        body:
          "Mimo ne remplace pas votre jugement. Il sert à reformuler ce que signifient les données, à signaler les limites, à proposer un angle de comparaison et à éviter les raccourcis trop rapides.",
      },
    ],
  },
  {
    id: "compare-and-decide",
    categoryId: "comparaison",
    title: "Comparer 2 ou 3 références sans se perdre",
    desc: "La bonne méthode pour garder une comparaison lisible et vraiment utile.",
    duration: "12 min",
    difficulty: "Intermédiaire",
    icon: "⚖️",
    content: [
      {
        title: "Pourquoi 3 références maximum",
        body:
          "Au-delà de trois produits comparables dans une même sous-catégorie, la décision devient plus bruyante. Le cerveau retient moins bien les compromis, et les écarts utiles se diluent. Trois références bien choisies suffisent presque toujours.",
      },
      {
        title: "Lire les axes avant les specs",
        body:
          "Le premier niveau de comparaison doit être PEFAS : pertinence, économie, fluidité, assurance, stabilité. Ensuite seulement viennent les données techniques qui expliquent les écarts. Ce séquencement évite de se perdre dans le détail avant de comprendre la logique globale.",
      },
      {
        title: "Comparer les vraies données utiles",
        body:
          "Une comparaison propre ne doit pas juxtaposer des dizaines de lignes inutiles. Elle doit isoler les données qui influencent la décision : capacité, bruit, autonomie, dimensions, mémoire, technologie, garantie, cadre marchand, etc.",
      },
      {
        title: "Savoir trancher",
        body:
          "Une bonne décision doit pouvoir s'expliquer simplement : pourquoi cette offre l'emporte, sur quels axes, avec quels compromis et pour quel contexte. Si vous ne pouvez pas l'expliquer, il manque encore un morceau du raisonnement.",
      },
    ],
  },
];

export const GUIDE_QUIZZES: GuideQuiz[] = [
  {
    id: "quiz-choisir",
    categoryId: "choisir",
    title: "Quiz : bien choisir son appareil",
    description: "10 questions pour vérifier si vous savez partir du bon besoin.",
    questions: [
      {
        q: "Avant toute comparaison, quel est le meilleur point de départ ?",
        options: ["Le produit le plus populaire", "Le besoin réel et les contraintes", "Le plus gros rabais", "La marque la plus visible"],
        correct: 1,
        explanation: "Une comparaison utile commence toujours par un besoin clair et des contraintes réelles.",
      },
      {
        q: "Pour un lave-linge, quel critère est généralement structurant ?",
        options: ["Le slogan commercial", "La capacité adaptée au foyer", "La couleur de façade", "Le nombre de boutons"],
        correct: 1,
        explanation: "La capacité doit coller au foyer et au rythme de lavage.",
      },
      {
        q: "Pourquoi faut-il vérifier les dimensions avant de comparer davantage ?",
        options: ["Parce que c est obligatoire légalement", "Parce qu un bon produit mal dimensionné devient un mauvais achat", "Parce que cela augmente toujours le score", "Parce que le prix dépend uniquement de cela"],
        correct: 1,
        explanation: "Un produit inadapté au logement ou à l'installation perd immédiatement en pertinence.",
      },
      {
        q: "Quel est le bon nombre de critères non négociables au départ ?",
        options: ["1", "2 ou 3", "7 ou 8", "Le plus possible"],
        correct: 1,
        explanation: "Deux ou trois critères forts suffisent pour cadrer la décision sans la rigidifier.",
      },
      {
        q: "Pour un smartphone, quel trio revient souvent dans la vraie décision ?",
        options: ["Packaging, couleur, hype", "Autonomie, fluidité, stockage", "Nombre de publicités", "Volume des ventes"],
        correct: 1,
        explanation: "Ces critères ont souvent plus d'impact quotidien que des promesses marketing plus spectaculaires.",
      },
      {
        q: "Un sèche-linge intéressant se juge uniquement sur sa technologie.",
        options: ["Vrai", "Faux"],
        correct: 1,
        explanation: "La technologie doit être lue avec le bruit, la capacité, l'entretien et l'usage réel.",
      },
      {
        q: "Quel budget est le plus utile pour décider ?",
        options: ["Un chiffre fixe inflexible", "Une fourchette avec zone cible", "Le budget moyen du marché", "Le plus petit prix possible"],
        correct: 1,
        explanation: "Une fourchette permet de mieux juger la valeur réelle d'un éventuel surcoût.",
      },
      {
        q: "Quel est le bon réflexe quand l'offre paraît parfaite mais mal documentée ?",
        options: ["Acheter vite", "Augmenter la vigilance", "Ignorer les manques", "Se fier aux photos"],
        correct: 1,
        explanation: "Un manque d'information est déjà un signal de risque ou d'incertitude.",
      },
      {
        q: "Le meilleur produit est toujours le plus cher.",
        options: ["Vrai", "Faux"],
        correct: 1,
        explanation: "Le meilleur choix dépend du contexte, du budget, de l'usage et des compromis acceptés.",
      },
      {
        q: "À quoi sert un projet MAREF bien rédigé ?",
        options: ["À stocker des liens", "À cadrer proprement l'intention d'achat", "À afficher des badges", "À créer un historique inutile"],
        correct: 1,
        explanation: "Le projet sert de cadre décisionnel pour rendre l'exploration, Mimo et la comparaison plus cohérents.",
      },
    ],
  },
  {
    id: "quiz-offre",
    categoryId: "offre",
    title: "Quiz : comprendre une offre",
    description: "10 questions pour mieux lire les prix, les fiches et les marchands.",
    questions: [
      {
        q: "Que démontre un prix barré à lui seul ?",
        options: ["Une vraie bonne affaire", "Pas grand-chose sans contexte", "Une grande durabilité", "Une livraison premium"],
        correct: 1,
        explanation: "Le prix barré attire l'attention mais ne prouve ni pertinence ni qualité réelle de l'offre.",
      },
      {
        q: "Une fiche produit riche sert surtout à :",
        options: ["Créer du désir uniquement", "Rendre la décision plus lisible", "Masquer les limites", "Justifier un prix élevé"],
        correct: 1,
        explanation: "Une fiche bien renseignée aide à relier les données au besoin réel.",
      },
      {
        q: "Quand une garantie est floue, quel axe est directement concerné ?",
        options: ["Pertinence", "Assurance", "Popularité", "Design"],
        correct: 1,
        explanation: "L'axe Assurance lit la confiance dans le cadre d'achat, la garantie et la fiabilité marchande.",
      },
      {
        q: "Les photos d'un produit remplacent-elles les données techniques ?",
        options: ["Oui", "Non"],
        correct: 1,
        explanation: "Les photos séduisent, les données structurent la décision.",
      },
      {
        q: "Pourquoi faut-il lire le marchand et pas seulement le produit ?",
        options: ["Parce que le marchand change la couleur du produit", "Parce que retour, SAV et lisibilité modifient le risque réel", "Parce que cela améliore automatiquement la note", "Parce que tous les marchands sont identiques"],
        correct: 1,
        explanation: "Le cadre marchand influence directement la qualité globale de l'achat.",
      },
      {
        q: "Que faut-il faire si une information importante manque ?",
        options: ["Supposer qu elle est favorable", "Ralentir la décision", "Acheter avant rupture", "Comparer seulement le prix"],
        correct: 1,
        explanation: "L'absence d'information doit augmenter la vigilance, pas la réduire.",
      },
      {
        q: "Le marché se lit en comparant seulement les prix.",
        options: ["Vrai", "Faux"],
        correct: 1,
        explanation: "Le marché se lit aussi via la densité d'information, les marchands, la cohérence de l'offre et le niveau de risque.",
      },
      {
        q: "À quoi sert Mimo sur une fiche offre ?",
        options: ["À faire de la publicité", "À traduire les données en impact concret", "À masquer les manques", "À imposer une décision"],
        correct: 1,
        explanation: "Mimo sert à reformuler, signaler les limites et aider à lire plus clairement.",
      },
      {
        q: "Une offre peut-elle être peu chère mais faible en économie ?",
        options: ["Oui", "Non"],
        correct: 0,
        explanation: "Oui, si la valeur réelle rendue ou la durabilité perçue sont trop faibles.",
      },
      {
        q: "Quel est le bon réflexe face à une offre mal documentée mais séduisante ?",
        options: ["Se fier à l'intuition", "Chercher à objectiver les manques", "Faire confiance à la promo", "Passer directement en favoris puis acheter"],
        correct: 1,
        explanation: "Une bonne décision consiste à objectiver les limites avant d'aller plus loin.",
      },
    ],
  },
  {
    id: "quiz-comparaison",
    categoryId: "comparaison",
    title: "Quiz : comparer et décider",
    description: "10 questions pour savoir construire une short-list et arbitrer proprement.",
    questions: [
      {
        q: "Combien de produits faut-il idéalement comparer dans la même sous-catégorie ?",
        options: ["1", "2 ou 3", "6", "Le plus possible"],
        correct: 1,
        explanation: "Deux ou trois références suffisent pour garder une comparaison lisible et exploitable.",
      },
      {
        q: "Quel est le bon ordre de lecture ?",
        options: ["Design, promo, packaging", "Axes, données techniques utiles, prix, risque", "Réseaux sociaux, avis, logo", "Prix puis tout le reste"],
        correct: 1,
        explanation: "Lire d'abord la logique de décision avant de plonger dans le détail technique rend l'arbitrage plus propre.",
      },
      {
        q: "Pourquoi limiter les comparaisons à la même sous-catégorie ?",
        options: ["Pour compliquer le produit", "Pour éviter des arbitrages incohérents", "Parce que la base l'impose", "Parce que tous les produits sont identiques"],
        correct: 1,
        explanation: "Comparer des produits trop différents crée du bruit et fausse la décision.",
      },
      {
        q: "Le meilleur produit est :",
        options: ["Toujours le plus connu", "Toujours le moins cher", "Celui qui colle le mieux au contexte", "Toujours celui qui gagne 3 axes"],
        correct: 2,
        explanation: "La meilleure option reste contextuelle, même quand un produit domine sur plusieurs points.",
      },
      {
        q: "À quoi servent les axes PEFAS dans une comparaison ?",
        options: ["À faire joli", "À expliquer les compromis et les forces", "À remplacer les specs", "À supprimer la réflexion"],
        correct: 1,
        explanation: "Les axes rendent visibles les raisons d'une recommandation et ses limites.",
      },
      {
        q: "Les données techniques doivent être comparées comment ?",
        options: ["Toutes sans distinction", "En isolant celles qui changent la décision", "En lisant seulement la plus longue fiche", "En se fiant au marchand préféré"],
        correct: 1,
        explanation: "Une bonne comparaison technique met en avant les specs qui influencent réellement l'usage et le risque.",
      },
      {
        q: "Quand deux produits sont proches, quel signal peut départager ?",
        options: ["Le slogan", "La lisibilité du cadre marchand", "La couleur du bouton d'achat", "Le volume de publicité"],
        correct: 1,
        explanation: "Le cadre marchand, la garantie et la qualité des données deviennent très utiles pour départager.",
      },
      {
        q: "Une recommandation difficile à expliquer signifie souvent :",
        options: ["Qu elle est encore immature", "Qu elle est meilleure", "Qu il faut acheter vite", "Que le score est inutile"],
        correct: 0,
        explanation: "Une bonne recommandation doit pouvoir être expliquée clairement et simplement.",
      },
      {
        q: "À quoi sert un comparateur par famille dans MAREF ?",
        options: ["À mélanger tous les achats", "À garder des arbitrages propres et comparables", "À dupliquer les offres", "À afficher plus de texte"],
        correct: 1,
        explanation: "Le comparateur par famille évite les mélanges absurdes et garde chaque décision lisible.",
      },
      {
        q: "Quel est le vrai but d'une comparaison MAREF ?",
        options: ["Acheter le plus vite possible", "Arbitrer avec moins d'incertitude", "Montrer plus de chiffres", "Faire comme tout le monde"],
        correct: 1,
        explanation: "L'objectif est de réduire l'incertitude et d'améliorer la qualité de décision.",
      },
    ],
  },
];
