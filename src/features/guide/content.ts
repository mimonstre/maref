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
    description: "Poser un besoin propre, lire les contraintes réelles et sélectionner la bonne famille de produit avant de comparer.",
    icon: "🎯",
  },
  {
    id: "offre",
    title: "Comprendre une offre",
    description: "Lire un marchand, un prix, une garantie, une promo et une fiche technique sans se laisser entraîner par le décor.",
    icon: "🔎",
  },
  {
    id: "comparaison",
    title: "Comparer et décider",
    description: "Construire une short-list, lire PEFAS correctement et trancher sans regret après achat.",
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
      q: "Pourquoi faut-il limiter la short-list à 2 ou 3 options proches ?",
      options: ["Parce que l’outil l’impose", "Parce que la lisibilité baisse vite au-delà", "Parce que le score MAREF disparaît", "Parce que les prix deviennent faux"],
      correct: 1,
      explanation: "Au-delà de 2 ou 3 options comparables, le bruit augmente et les écarts réellement utiles deviennent moins lisibles.",
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
        `Le bon point de départ pour ${subcategoryName.toLowerCase()} n'est jamais la fiche la plus séduisante. Il faut d'abord clarifier l'usage, les contraintes de logement, le niveau d'exigence et le niveau de risque acceptable. Dans ${familyName.toLowerCase()}, cette étape évite de comparer des références qui n'ont en réalité rien à faire dans la même short-list.`,
        `Posez quatre questions simples : quel usage principal doit être couvert, quelle contrainte est non négociable, quel compromis reste acceptable et quel horizon de conservation vous visez. Une fois ce cadre posé, les caractéristiques techniques reprennent leur vraie fonction : aider à décider, pas occuper l'écran.`,
        `Quand MAREF devient utile, c'est précisément à ce moment : traduire un besoin flou en arbitrage lisible pour ne garder que quelques options réellement crédibles.`
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
      title: "Construire une short-list exploitable",
      body: lessonBody(
        `Une bonne short-list pour ${subcategoryName.toLowerCase()} contient peu d'options, mais de bonnes options. L'objectif n'est pas de collectionner des références. L'objectif est de faire apparaître des arbitrages lisibles entre deux ou trois directions plausibles.`,
        `Une option peut rester dans la short-list parce qu'elle est la plus économique, la plus équilibrée, la plus robuste ou la plus rassurante côté marchand. Tant que cette raison n'est pas claire, la référence ajoute du bruit plutôt que de la valeur.`,
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

export const GUIDE_MODULES: GuideModule[] = [
  {
    id: "choose-washing-machine",
    categoryId: "choisir",
    title: "Comment choisir son lave-linge",
    desc: "Capacité, bruit, dimensions, usage et compromis réels.",
    duration: "14 min",
    difficulty: "Essentiel",
    icon: "🧺",
    content: [
      { title: "Partir du foyer et du rythme de vie", body: lessonBody("Le bon lave-linge n’est pas celui qui affiche le plus de programmes. C’est celui qui colle au volume de linge, à la fréquence des cycles et au niveau d’exigence réel du foyer.", "Avant même de comparer des références, posez noir sur blanc : combien de personnes vivent dans le foyer, à quelle fréquence la machine tourne, et quel niveau de bruit est acceptable.", "Une fois ce cadre posé, MAREF devient plus utile : vous pouvez écarter rapidement les références trop petites, trop bruyantes ou mal adaptées à votre usage.") },
      { title: "Lire les contraintes physiques avant les promesses", body: lessonBody("Les dimensions, la profondeur, l’ouverture du hublot et la place disponible dans le logement doivent être validées avant toute lecture plus fine.", "Le bruit est souvent sous-estimé, alors qu’il change directement le quotidien, surtout dans les appartements compacts ou les pièces de vie ouvertes.", "Le bon réflexe consiste à filtrer très tôt ces contraintes non négociables pour comparer seulement des options réellement crédibles.") },
      { title: "Hiérarchiser les critères qui changent vraiment le confort", body: lessonBody("Capacité, essorage, niveau sonore, lisibilité des programmes, qualité perçue et garantie ont souvent plus d’impact que des arguments marketing spectaculaires.", "Ce qui compte, c’est de traduire chaque donnée en conséquence concrète : est-ce plus simple à vivre, plus silencieux, plus durable, plus rassurant ou simplement plus cher sans bénéfice clair ?", "Quand vous comparez ensuite deux ou trois offres, vous savez exactement quoi regarder.") },
      { title: "Assumer le bon compromis final", body: lessonBody("Le meilleur lave-linge n’est pas celui qui gagne partout. C’est celui qui perd le moins sur les points secondaires tout en protégeant les critères les plus importants pour vous.", "Un modèle plus cher peut rester meilleur s’il réduit le bruit, améliore la capacité ou rassure sur le marchand.", "Une décision solide doit pouvoir se résumer simplement : pourquoi cette option, dans votre logement, pour votre foyer, avec quels compromis assumés.") },
    ],
  },
  {
    id: "choose-dryer",
    categoryId: "choisir",
    title: "Comment choisir son sèche-linge",
    desc: "Technologie, capacité, bruit et cohérence avec le foyer.",
    duration: "12 min",
    difficulty: "Essentiel",
    icon: "🌬️",
    content: [
      { title: "Relier la technologie au vrai besoin", body: lessonBody("Un sèche-linge doit être choisi selon votre rythme, votre volume de linge, votre patience face à la durée des cycles et votre tolérance au bruit.", "Avant de lire les offres, demandez-vous combien de fois par semaine vous séchez, si l’appareil sera visible ou isolé, et si vous cherchez surtout du confort, du gain de temps ou un bon équilibre économique.", "Cette première clarification évite d’acheter une technologie séduisante mais mal alignée avec votre rythme de vie.") },
      { title: "Garder la cohérence avec le lave-linge", body: lessonBody("Le sèche-linge ne doit pas être lu seul. Sa capacité, son format et son usage doivent rester cohérents avec le lave-linge déjà présent ou envisagé.", "Une capacité trop faible impose des charges fractionnées, tandis qu’une machine trop ambitieuse pour votre usage peut vous faire payer plus sans bénéfice réel.", "Le bon réflexe est de lire la fiche dans un contexte d’équipement global, pas comme un objet isolé.") },
      { title: "Lire les critères structurants", body: lessonBody("Sur ce type de produit, les données vraiment utiles sont souvent peu nombreuses : bruit, capacité, durée des cycles, qualité perçue, garantie et confort d’usage.", "Plus une fiche est claire, stable et simple à interpréter, plus la décision gagne en sécurité.", "MAREF est utile ici pour vous aider à remettre les critères dans le bon ordre au lieu de laisser le catalogue décider à votre place.") },
      { title: "Trancher entre coût, confort et risque", body: lessonBody("Une décision propre ne consiste pas à viser l’appareil parfait, mais à choisir celui dont les compromis sont les plus acceptables dans votre contexte.", "Le bon choix peut être le plus simple, le plus robuste ou le plus équilibré.", "Une fois la short-list posée, le comparateur devient l’endroit où la décision se formalise réellement.") },
    ],
  },
  {
    id: "choose-phone-pc",
    categoryId: "choisir",
    title: "Comment choisir un téléphone, une tablette ou un PC",
    desc: "Traduire les spécifications en confort réel.",
    duration: "16 min",
    difficulty: "Intermédiaire",
    icon: "💻",
    content: [
      { title: "Commencer par les usages dominants", body: lessonBody("Le bon appareil numérique ne se choisit pas à partir d’une fiche technique seule. Il faut partir des usages dominants.", "Bureautique, photo, mobilité, jeu, appels, création, autonomie ou confort d’écran doivent être hiérarchisés avant la lecture des specs.", "Cette étape réduit énormément le bruit dans l’explorer et évite les comparaisons abstraites.") },
      { title: "Séparer les spécifications qui changent vraiment la décision", body: lessonBody("Mémoire, stockage, écran, autonomie, poids, suivi logiciel et confort général comptent souvent plus qu’une somme de caractéristiques impressionnantes mais peu utiles.", "La bonne question n’est pas quelle fiche est la plus riche, mais quelles lignes de cette fiche transforment réellement mon usage ou mon coût d’erreur.", "Dans MAREF, l’objectif est justement de passer d’une lecture décorative des données à une lecture orientée décision.") },
      { title: "Lire le prix avec l’horizon de conservation", body: lessonBody("Un appareil un peu plus cher peut rester meilleur s’il dure plus longtemps ou s’il limite les risques de frustration et de remplacement rapide.", "À l’inverse, un prix séduisant n’est pas forcément une économie réelle si le suivi logiciel est faible ou la mémoire trop courte.", "La bonne comparaison consiste donc à relier le prix à la durée d’usage attendue, et pas seulement à l’achat immédiat.") },
      { title: "Éviter la prime de marque automatique", body: lessonBody("Une marque forte peut apporter un vrai écosystème, un meilleur confort logiciel ou une meilleure continuité d’usage.", "Mais elle peut aussi simplement faire monter la facture si ces bénéfices ne servent pas votre cas.", "Une décision solide repose sur des avantages visibles, pas sur un prestige supposé.") },
    ],
  },
  {
    id: "understand-prices",
    categoryId: "offre",
    title: "Comprendre les prix et le marché",
    desc: "Lire au-delà du prix barré et de l’urgence promo.",
    duration: "11 min",
    difficulty: "Essentiel",
    icon: "💶",
    content: [
      { title: "Le prix n’est jamais la décision à lui seul", body: lessonBody("Un prix attire l’œil, mais il n’explique ni la pertinence du produit, ni la qualité marchande, ni le niveau de risque.", "Deux offres proches en tarif peuvent raconter des histoires très différentes selon la garantie, le vendeur, la livraison, la lisibilité des données et la stabilité du produit.", "Une comparaison utile replace donc le prix dans une structure plus large au lieu de le traiter comme un verdict immédiat.") },
      { title: "Le prix barré n’est pas une preuve", body: lessonBody("Une promotion doit toujours être lue avec distance.", "La bonne méthode consiste à demander : cette offre resterait-elle intéressante si l’habillage promotionnel disparaissait ?", "Le rôle de MAREF est justement de redonner du relief à ce que la promo écrase trop vite.") },
      { title: "Le marché est fragmenté", body: lessonBody("À produit proche, les marchands peuvent se distinguer fortement sur la livraison, la garantie, la transparence de l’offre ou la facilité à corriger un problème après achat.", "Cela veut dire qu’un écart de prix modéré peut parfois être largement justifié par un meilleur cadre marchand.", "Lire le marché correctement, c’est comparer des offres, pas juste aligner des tarifs.") },
      { title: "Le manque d’information est un signal de marché", body: lessonBody("Une fiche floue, un marchand peu lisible ou des conditions vagues ne doivent jamais être lus comme des détails secondaires.", "Quand l’information manque, le bon réflexe n’est pas d’inventer le reste ni de supposer que tout ira bien.", "Une offre propre n’est pas seulement bien placée en prix. Elle est aussi compréhensible et défendable.") },
    ],
  },
  {
    id: "understand-product-sheet",
    categoryId: "offre",
    title: "Comprendre une fiche produit",
    desc: "Faire parler une fiche technique sans se laisser noyer.",
    duration: "12 min",
    difficulty: "Essentiel",
    icon: "🧾",
    content: [
      { title: "Lire une fiche comme un outil de décision", body: lessonBody("Une fiche produit ne doit pas être lue comme un catalogue décoratif.", "Le nom commercial, les slogans et les adjectifs valorisants n’ont de sens que s’ils se traduisent en différence réelle dans l’usage.", "Le bon réflexe est donc de repérer d’abord les quelques données qui structurent vraiment le choix.") },
      { title: "Transformer une spécification en impact réel", body: lessonBody("Une capacité, un bruit, une mémoire, une dimension ou une autonomie ne valent pas pour elles-mêmes.", "Elles valent par ce qu’elles changent dans l’expérience d’usage.", "C’est cette traduction qui différencie un acheteur piloté par la fiche d’un acheteur capable de piloter sa décision.") },
      { title: "Repérer les signaux de fiabilité", body: lessonBody("Une fiche claire, stable, structurée et cohérente inspire plus confiance qu’une fiche instable ou incomplète.", "Cela ne veut pas dire qu’une fiche parfaite garantit un bon achat.", "Cela veut dire qu’une fiche pauvre doit automatiquement vous rendre plus prudent.") },
      { title: "Savoir quand une fiche n’est pas suffisante", body: lessonBody("Certaines décisions nécessitent davantage qu’une fiche produit : il faut alors regarder le marchand, la garantie, les conditions de retour, la livraison et la comparaison avec d’autres offres.", "Une bonne fiche aide, mais elle ne remplace pas une vraie lecture marchande et comparative.", "Le bon usage de MAREF consiste à relier la fiche produit, l’offre marchande, le comparateur et le projet pour obtenir une vision complète.") },
    ],
  },
  {
    id: "understand-merchant-risk",
    categoryId: "offre",
    title: "Comprendre le risque marchand",
    desc: "Lire la garantie, la livraison et le retour comme de vrais critères.",
    duration: "10 min",
    difficulty: "Intermédiaire",
    icon: "🏬",
    content: [
      { title: "Le vendeur fait partie de l’offre", body: lessonBody("Une offre marchande ne se réduit pas à un prix.", "Elle inclut le vendeur, les conditions de service, la clarté de la promesse et la capacité à gérer un problème si quelque chose tourne mal.", "Lire le vendeur comme un critère à part entière évite de sous-estimer une partie majeure du risque.") },
      { title: "Garantie, retour et livraison doivent être lus ensemble", body: lessonBody("Une bonne garantie ne compense pas forcément une livraison douteuse ou une politique de retour opaque.", "Le bon réflexe est de considérer l’ensemble du cadre marchand plutôt que d’isoler une seule ligne rassurante.", "C’est précisément pour cela que l’axe Assurance ne se limite pas à une durée de garantie.") },
      { title: "Reconnaître les zones rouges", body: lessonBody("Promesses trop agressives, conditions peu lisibles, informations absentes ou vocabulaire flou sont des signaux qui doivent ralentir la décision.", "Quand plusieurs petits doutes s’accumulent, ils finissent par former un vrai risque.", "Une décision solide sait aussi dire non à une offre séduisante mais mal tenue.") },
      { title: "Utiliser le comparateur pour sécuriser le choix", body: lessonBody("Le comparateur n’est pas seulement utile pour lire des écarts de score.", "Il sert aussi à voir si un marchand tire une offre vers le bas malgré un produit intéressant.", "Une bonne décision sait ainsi protéger à la fois le bon objet et le bon niveau de sécurité marchande.") },
    ],
  },
  {
    id: "build-shortlist",
    categoryId: "comparaison",
    title: "Construire une short-list utile",
    desc: "Réduire le bruit avant de comparer en profondeur.",
    duration: "12 min",
    difficulty: "Intermédiaire",
    icon: "📌",
    content: [
      { title: "Pourquoi une short-list change tout", body: lessonBody("Tant que vous comparez un trop grand nombre de références, la décision reste floue.", "Une short-list de 2 ou 3 options force la clarté et rend les compromis visibles.", "Une bonne short-list prépare une bonne comparaison. Une mauvaise short-list rend même un bon comparateur inefficace.") },
      { title: "Choisir les bons candidats", body: lessonBody("Les meilleures short-lists ne sont pas composées de produits choisis au hasard.", "Elles doivent refléter des options réellement concurrentes sur votre besoin.", "Dans MAREF, la logique par famille aide justement à garder cette discipline.") },
      { title: "Éviter les doublons déguisés", body: lessonBody("Trop de short-lists se remplissent de références presque identiques.", "Le bon réflexe est de se demander si cette option apporte un vrai angle alternatif ou si elle répète le même sujet.", "Une short-list utile maximise l’apprentissage, pas le volume.") },
      { title: "Savoir quand la short-list est prête", body: lessonBody("Une short-list devient prête quand chaque option a une raison claire d’exister.", "Meilleure valeur, meilleur confort, meilleur marchand, meilleure stabilité ou meilleur prix.", "Si vous ne savez pas expliquer pourquoi une référence est encore là, elle mérite souvent d’être retirée.") },
    ],
  },
  {
    id: "read-score-pefas",
    categoryId: "comparaison",
    title: "Lire le score MAREF et PEFAS",
    desc: "Comprendre ce que la note dit vraiment, et ce qu’elle ne dit pas.",
    duration: "11 min",
    difficulty: "Intermédiaire",
    icon: "📊",
    content: [
      { title: "Lire la note sans l’absolutiser", body: lessonBody("Le score MAREF est un outil de lecture, pas une vérité sacrée.", "Il sert à accélérer une comparaison propre quand les données utiles sont présentes, pas à remplacer votre jugement.", "Le bon usage du score, c’est donc de l’utiliser comme point d’entrée, jamais comme argument unique.") },
      { title: "Pourquoi PEFAS compte autant que la note", body: lessonBody("Les axes PEFAS permettent de voir où une offre est forte et où elle reste plus fragile.", "C’est ce détail qui évite de confondre une bonne note globale avec une bonne réponse à votre besoin spécifique.", "La bonne lecture consiste donc à regarder la note puis les axes qui l’expliquent.") },
      { title: "Repérer les compromis cachés", body: lessonBody("Une offre peut très bien performer globalement tout en restant faible sur l’axe qui compte le plus pour vous.", "Lire les compromis, c’est voir où une offre gagne et où elle vous demande d’accepter quelque chose de moins bon.", "Une bonne décision sait justement choisir les compromis acceptables et rejeter les autres.") },
      { title: "Relier le score au contexte projet", body: lessonBody("Le score gagne en intérêt quand il est replacé dans un projet réel.", "Budget, objectif, références déjà suivies et niveau d’exigence changent sa lecture.", "C’est ce qui permet à MAREF d’être plus qu’un simple affichage de notes.") },
    ],
  },
  {
    id: "decide-with-confidence",
    categoryId: "comparaison",
    title: "Décider avec confiance",
    desc: "Transformer une comparaison en décision assumée.",
    duration: "10 min",
    difficulty: "Intermédiaire",
    icon: "✅",
    content: [
      { title: "Reconnaître qu’une décision est mûre", body: lessonBody("Une décision devient mûre quand les critères vraiment importants sont clairs, les options comparables et les compromis compris.", "Ce n’est pas la certitude absolue qui compte. C’est le fait de savoir pourquoi une option l’emporte.", "Une décision solide est donc avant tout une décision explicable.") },
      { title: "Ne pas viser la perfection théorique", body: lessonBody("Le produit parfait n’existe pas.", "Chercher la perfection retarde souvent une bonne décision au profit d’une quête abstraite.", "Le bon objectif est de trouver l’option la plus cohérente avec votre situation réelle.") },
      { title: "Assumer le compromis final", body: lessonBody("Choisir, c’est accepter qu’une option perde sur certains points pour gagner sur ceux qui comptent le plus.", "Quand vous savez nommer ce compromis, vous réduisez fortement le risque de regret post-achat.", "Le comparateur et Mimo servent justement à mettre ces arbitrages en mots avant l’achat.") },
      { title: "Faire de MAREF un réflexe utile", body: lessonBody("La bonne habitude n’est pas d’ouvrir vingt onglets.", "La bonne habitude, c’est de cadrer, réduire, comparer, puis décider.", "Plus ce schéma devient naturel, plus vos achats importants gagnent en qualité et en sérénité.") },
    ],
  },
  ...choosingSubcategoryModules,
];

export const GUIDE_QUIZZES: GuideQuiz[] = GUIDE_MODULES.map((module) => ({
  id: `quiz-${module.id}`,
  categoryId: module.categoryId,
  moduleId: module.id,
  title: `Quiz : ${module.title}`,
  description: `10 questions pour vérifier si vous maîtrisez les réflexes clés du module « ${module.title} ».`,
  questions: createQuiz(module.title, module.desc),
}));
