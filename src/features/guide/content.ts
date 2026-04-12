export type GuideModule = {
  id: string;
  title: string;
  desc: string;
  progress: number;
  lessons: number;
  icon: string;
  difficulty: string;
  duration: string;
  content: string[];
};

export type GuideQuiz = {
  id: string;
  title: string;
  questions: {
    q: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
};

export const GUIDE_MODULES: GuideModule[] = [
  {
    id: "g1",
    title: "Bien cadrer son besoin avant d acheter",
    desc: "La base pour eviter de comparer de mauvais produits des le depart.",
    progress: 0,
    lessons: 6,
    icon: "🎯",
    difficulty: "Essentiel",
    duration: "12 min",
    content: [
      "Commencez par le besoin, pas par la marque. Demandez-vous ce que le produit doit resoudre dans votre quotidien.",
      "Listez 3 criteres non negociables. Exemple : capacite, bruit, dimensions, autonomie, puissance, connectique.",
      "Distinguez besoin reel et desir de confort. Cela aide a ne pas surpayer des fonctions peu utiles.",
      "Fixez une fourchette budget avec une borne basse, une borne cible et une borne haute.",
      "Reperez vos contraintes de contexte : taille du foyer, logement, frequence d usage, transport, installation.",
      "Un bon projet MAREF commence quand votre besoin tient en une phrase simple et verifiable.",
    ],
  },
  {
    id: "g2",
    title: "Lire une fiche produit sans se faire influencer",
    desc: "Apprendre a distinguer les signaux utiles des arguments marketing.",
    progress: 0,
    lessons: 6,
    icon: "🧾",
    difficulty: "Essentiel",
    duration: "14 min",
    content: [
      "Le nom commercial raconte rarement l essentiel. Regardez plutot reference, capacite, dimensions, garantie et connectique.",
      "Un prix barre n est pas une preuve de bonne affaire. Il faut savoir si le produit reste bon apres remise, pas seulement moins cher.",
      "Les photos montrent le desir. Les specs montrent la realite. Toujours revenir aux caracteristiques utiles a votre cas.",
      "Une fiche incomplete est un signal faible. Si des donnees importantes manquent, il faut ralentir la decision.",
      "Une bonne fiche produit vous permet de repondre a trois questions : est-ce adapte, combien ca coute vraiment, quels risques j accepte.",
      "Utilisez Mimo pour traduire les specs en impact concret : bruit, usage, fiabilite, compatibilite, cout total.",
    ],
  },
  {
    id: "g3",
    title: "Comprendre vraiment le score MAREF et PEFAS",
    desc: "Ce que mesure le score, ce qu il ne mesure pas, et comment l utiliser correctement.",
    progress: 0,
    lessons: 7,
    icon: "📊",
    difficulty: "Intermediaire",
    duration: "16 min",
    content: [
      "Le score MAREF n est pas une note de popularite. C est une lecture d aide a la decision.",
      "P = Pertinence : le produit colle-t-il a votre besoin reel et a votre projet d achat.",
      "E = Economie : que payez-vous vraiment pour la valeur rendue, pas seulement le prix d entree.",
      "F = Fluidite : accessibilite de l offre, clarte d achat, friction logistique, lisibilite marchande.",
      "A = Assurance : niveau de confiance sur le marchand, la garantie, les informations disponibles et le cadre de vente.",
      "S = Stabilite : robustesse dans le temps, coherence de l offre, perennite attendue, regularite des signaux.",
      "Le bon usage du score : l utiliser pour prioriser, puis lire les axes et les vigilances avant de trancher.",
    ],
  },
  {
    id: "g4",
    title: "Comparer intelligemment sans se noyer",
    desc: "La bonne methode pour comparer 2 ou 3 references sans perdre le fil.",
    progress: 0,
    lessons: 6,
    icon: "⚖️",
    difficulty: "Intermediaire",
    duration: "15 min",
    content: [
      "Comparer 10 produits en meme temps fatigue et brouille la decision. Limitez-vous a 2 ou 3 references par famille.",
      "Une bonne comparaison oppose un choix prudent, un choix equilibre et un choix ambitieux.",
      "Comparez d abord les axes, ensuite les specs techniques, puis le cout et les risques. Pas l inverse.",
      "Une alternative moins bien notee peut rester valable si elle repond a un critere prioritaire de votre projet.",
      "Le meilleur produit n est pas universel. Le meilleur pour vous depend du budget, de l usage et du niveau d exigence.",
      "Si deux produits sont proches, regardez la qualite de l information et la clarté marchande avant de decider.",
    ],
  },
  {
    id: "g5",
    title: "Budget, cout total et faux bons plans",
    desc: "Eviter les achats qui paraissent economiques mais coutent plus cher ensuite.",
    progress: 0,
    lessons: 6,
    icon: "💶",
    difficulty: "Intermediaire",
    duration: "14 min",
    content: [
      "Le bon budget n est pas seulement le prix d achat. Il faut penser duree, energie, accessoires, livraison et remplacement.",
      "Un produit moins cher aujourd hui peut etre plus couteux demain s il est mal dimensionne, fragile ou peu durable.",
      "Le cout total sert a comparer deux produits qui n ont pas le meme prix mais pas non plus la meme valeur.",
      "Une promotion est utile seulement si vous auriez considere le produit hors promo.",
      "La bonne question n est pas : combien j economise maintenant ? C est : est-ce le bon achat pour les prochaines annees ?",
      "Dans MAREF, un bon arbitrage budget cherche l equilibre entre valeur, risque et horizon d usage.",
    ],
  },
  {
    id: "g6",
    title: "Fiabilite marchand, garanties et vigilance",
    desc: "Ce que beaucoup d acheteurs ne regardent qu apres le probleme.",
    progress: 0,
    lessons: 5,
    icon: "🛡️",
    difficulty: "Essentiel",
    duration: "11 min",
    content: [
      "Un bon marchand, ce n est pas juste un bon prix. C est une vente claire, une garantie lisible et un SAV credible.",
      "Quand une information importante manque, la vigilance doit monter. L absence de precision est deja un signal.",
      "Les conditions de retour, delais et disponibilites doivent etre comprises avant l achat, pas apres.",
      "Pour les achats importants, mieux vaut une offre legerement moins agressive mais plus lisible et plus defendable.",
      "Le but de MAREF n est pas de vous faire acheter vite. C est de vous faire acheter juste.",
    ],
  },
];

export const GUIDE_QUIZZES: GuideQuiz[] = [
  {
    id: "q1",
    title: "Cadrer son besoin",
    questions: [
      {
        q: "Avant de comparer, quelle est la meilleure premiere etape ?",
        options: ["Choisir la marque la plus connue", "Chercher la plus grosse promo", "Definir clairement le besoin et les contraintes", "Lire les avis les plus positifs"],
        correct: 2,
        explanation: "Une comparaison devient utile quand le besoin est clair. Sinon on compare des produits mal choisis des le depart.",
      },
      {
        q: "Combien de criteres non negociables faut-il idealement fixer au debut ?",
        options: ["1", "2 ou 3", "8 ou 9", "Le plus possible"],
        correct: 1,
        explanation: "Deux ou trois criteres forts suffisent pour cadrer une decision sans la rendre rigide ni confuse.",
      },
      {
        q: "Le bon budget initial doit etre :",
        options: ["Un seul chiffre fixe", "Une fourchette avec borne cible", "Le moins cher possible", "Le budget conseille par la marque"],
        correct: 1,
        explanation: "Une fourchette donne de la souplesse sans perdre le cadre de decision.",
      },
      {
        q: "Lequel est une contrainte de contexte pertinente ?",
        options: ["Le packaging", "Le slogan du produit", "Les dimensions de votre logement", "La couleur du site marchand"],
        correct: 2,
        explanation: "Les dimensions et contraintes d usage changent directement la pertinence d un produit.",
      },
      {
        q: "Un bon projet MAREF commence quand :",
        options: ["Vous avez 20 produits ouverts", "Votre besoin tient en une phrase claire", "Vous avez lu 100 avis", "Vous avez choisi un vendeur"],
        correct: 1,
        explanation: "Un besoin clair rend toute la suite plus simple : explorer, filtrer, comparer, decider.",
      },
    ],
  },
  {
    id: "q2",
    title: "Lire une fiche produit",
    questions: [
      {
        q: "Quel element est le plus souvent trompeur s il est lu seul ?",
        options: ["Le prix barre", "La reference", "La capacite", "La garantie"],
        correct: 0,
        explanation: "Un prix barre attire l attention mais ne suffit jamais pour juger la qualite reelle de l offre.",
      },
      {
        q: "Si une fiche manque d informations importantes, il faut :",
        options: ["Acheter vite avant rupture", "Monter la vigilance", "Supposer que tout va bien", "Ignorer le manque d infos"],
        correct: 1,
        explanation: "Le manque d information est deja un signal de risque ou d incertitude.",
      },
      {
        q: "Les photos servent surtout a :",
        options: ["Verifier le desir cree autour du produit", "Mesurer la fiabilite du SAV", "Remplacer les specs techniques", "Prouver que le produit est le meilleur"],
        correct: 0,
        explanation: "Les photos aident a se projeter, mais elles ne remplacent jamais une lecture serieuse des caracteristiques.",
      },
      {
        q: "Quelle question une bonne fiche doit aider a resoudre ?",
        options: ["Est-ce tendance ?", "Est-ce adapte a mon besoin ?", "Est-ce populaire sur les reseaux ?", "Est-ce le plus vendu ?"],
        correct: 1,
        explanation: "Le coeur d une fiche utile est l adequation au besoin, pas la mise en scene marketing.",
      },
      {
        q: "Mimo sert notamment a :",
        options: ["Faire de la pub pour les marchands", "Traduire l information en impact concret", "Masquer les limites des donnees", "Remplacer votre jugement"],
        correct: 1,
        explanation: "Mimo aide a lire, nuancer et contextualiser. Il n est pas la pour vendre ni simplifier a outrance.",
      },
    ],
  },
  {
    id: "q3",
    title: "Score MAREF et PEFAS",
    questions: [
      {
        q: "Le score MAREF doit etre utilise en priorite pour :",
        options: ["Valider un achat sans lire le reste", "Prioriser puis approfondir", "Choisir la promo la plus forte", "Remplacer les specs"],
        correct: 1,
        explanation: "Le score sert a trier et a cadrer, puis les axes et vigilances servent a arbitrer.",
      },
      {
        q: "Que mesure l axe P ?",
        options: ["Popularite", "Pertinence", "Precision", "Puissance"],
        correct: 1,
        explanation: "P signifie Pertinence : l adequation du produit a votre besoin et votre projet.",
      },
      {
        q: "Quel axe aide le plus a lire la valeur economique globale ?",
        options: ["E", "F", "A", "S"],
        correct: 0,
        explanation: "E pour Economie : rapport cout / valeur, et pas seulement prix facial.",
      },
      {
        q: "L axe A est surtout utile pour lire :",
        options: ["Le design", "La confiance marchande et la garantie", "La vitesse du produit", "La couleur"],
        correct: 1,
        explanation: "A = Assurance : lisibilite de l offre, cadre de vente, garantie et fiabilite du marchand.",
      },
      {
        q: "Un bon score sans details d axes doit etre lu comme :",
        options: ["Suffisant", "Encore incomplet", "Definitif", "Superieur a tous les autres"],
        correct: 1,
        explanation: "Les axes servent a comprendre pourquoi le score existe et ou se situent les compromis.",
      },
      {
        q: "Pourquoi PEFAS est utile ?",
        options: ["Parce qu il complique les choses", "Parce qu il separe les dimensions de decision", "Parce qu il remplace tout jugement humain", "Parce qu il suit la mode"],
        correct: 1,
        explanation: "PEFAS rend visible ce qui est souvent melange dans une note globale opaque.",
      },
    ],
  },
  {
    id: "q4",
    title: "Comparer et decider",
    questions: [
      {
        q: "Combien de produits faut-il idealement comparer en meme temps ?",
        options: ["2 ou 3", "10", "Le plus possible", "1 seul"],
        correct: 0,
        explanation: "Au-dela de 3, la comparaison fatigue et la lecture devient moins nette.",
      },
      {
        q: "Quel est le bon ordre de lecture ?",
        options: ["Prix, couleur, promo", "Axes, specs, cout, risques", "Avis reseaux, promo, score", "Design, packaging, note"],
        correct: 1,
        explanation: "On lit d abord la logique, ensuite la technique, puis le cout et le risque.",
      },
      {
        q: "Le meilleur produit est :",
        options: ["Toujours le plus cher", "Toujours celui avec la meilleure promo", "Celui qui colle le mieux a votre contexte", "Celui avec la plus grosse marque"],
        correct: 2,
        explanation: "Il n y a pas de meilleur produit absolu. Il y a un meilleur choix selon votre besoin.",
      },
      {
        q: "Quand deux produits sont tres proches, il faut regarder ensuite :",
        options: ["Le packaging", "La lisibilite de l offre et le risque", "Le slogan", "Le nombre d emojis sur la fiche"],
        correct: 1,
        explanation: "Quand la performance est proche, la clarte marchande et la qualite d information peuvent faire la difference.",
      },
      {
        q: "Une bonne comparaison sert surtout a :",
        options: ["Impressionner", "Rassurer artificiellement", "Arbitrer avec moins d incertitude", "Acheter plus vite a tout prix"],
        correct: 2,
        explanation: "Le but est de decider plus juste, pas de decider plus brutalement.",
      },
    ],
  },
];
