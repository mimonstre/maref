export type GuideLesson = {
  title: string;
  body: string;
};

export type GuideModule = {
  id: string;
  title: string;
  desc: string;
  progress: number;
  lessons: number;
  icon: string;
  difficulty: string;
  duration: string;
  content: GuideLesson[];
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
    title: "Comment choisir son appareil sans se tromper",
    desc: "Une methode concrete pour partir du besoin reel et non du marketing.",
    progress: 0,
    lessons: 5,
    icon: "🧭",
    difficulty: "Essentiel",
    duration: "18 min",
    content: [
      {
        title: "Partir du besoin reel",
        body:
          "Commencez toujours par votre usage et vos contraintes, pas par la marque. Pour un lave-linge, cela veut dire le volume de linge, la place disponible, le niveau sonore acceptable et la frequence d utilisation. Pour un smartphone, cela veut dire autonomie, photo, fluidite, stockage et duree de conservation. Si votre besoin n est pas clair, la comparaison devient automatiquement brouillee.",
      },
      {
        title: "Poser 3 criteres non negociables",
        body:
          "Fixez trois criteres prioritaires avant d ouvrir dix fiches produit. Sur un seche-linge, ce peut etre la pompe a chaleur, la capacite et le bruit. Sur un PC portable, ce peut etre l autonomie, la taille d ecran et la memoire vive. Ces criteres servent a eliminer vite ce qui ne colle pas, puis a comparer seulement les references encore pertinentes.",
      },
      {
        title: "Cadrer le budget intelligemment",
        body:
          "Ne fixez pas un seul prix maximum. Travaillez plutot avec une zone basse, une zone cible et une zone haute acceptable. Cela vous aide a voir si payer un peu plus apporte vraiment une meilleure durabilite, une meilleure garantie ou un meilleur confort d usage. L objectif n est pas d acheter le moins cher, mais d acheter juste.",
      },
      {
        title: "Identifier le vrai contexte d achat",
        body:
          "Un produit bon en theorie peut etre mauvais dans votre situation. Un refrigerateur multidoor n a pas de sens dans une petite cuisine. Un telephone photo tres haut de gamme n est pas prioritaire si votre vrai besoin est l autonomie et la simplicite. Le bon choix est toujours contextuel.",
      },
      {
        title: "Construire un projet utile dans MAREF",
        body:
          "Un projet doit resumer l intention d achat en une phrase claire : equiper un studio, remplacer un lave-linge en urgence, trouver un smartphone durable pour 500 euros maximum. Plus le projet est propre, plus les recommandations, les comparaisons et Mimo deviennent utiles.",
      },
    ],
  },
  {
    id: "g2",
    title: "Comment choisir un lave-linge, un seche-linge ou un refrigerateur",
    desc: "Les vrais points de decision pour le gros electromenager du quotidien.",
    progress: 0,
    lessons: 6,
    icon: "🧺",
    difficulty: "Essentiel",
    duration: "22 min",
    content: [
      {
        title: "Bien choisir un lave-linge",
        body:
          "Les points decisifs sont la capacite, l essorage, le bruit, l encombrement et la fiabilite percue. Une petite machine peut suffire pour une personne seule, mais devenir vite limitante pour un foyer. Le meilleur lave-linge n est pas le plus technologique : c est celui qui lave correctement, rentre chez vous, reste supportable au quotidien et tient dans le temps.",
      },
      {
        title: "Bien choisir un seche-linge",
        body:
          "Commencez par distinguer condensation classique et pompe a chaleur. La pompe a chaleur est souvent plus interessante sur la duree, mais il faut regarder le temps de cycle, la capacite et la facilite d entretien. Pour un usage intensif, la regularite et la lisibilite de l offre comptent autant que le prix.",
      },
      {
        title: "Bien choisir un refrigerateur",
        body:
          "Sur un frigo top, un une porte ou un multi-door, les dimensions et l organisation interieure sont souvent plus importantes que la promesse marketing. Regardez la capacite utile, le niveau sonore, la classe energetique quand elle est disponible, et la logique du rangement. Un refrigerateur mal adapte se subit tous les jours.",
      },
      {
        title: "Les erreurs classiques en electromenager",
        body:
          "Les erreurs les plus frequentes sont le surdimensionnement, le sous-dimensionnement et le mauvais arbitrage entre prix court terme et cout reel. On prend parfois le plus gros appareil alors qu on n en a pas besoin, ou l offre la moins chere alors que la durabilite et le confort sont mediocres. MAREF sert justement a objectiver ce compromis.",
      },
      {
        title: "Ce qu il faut comparer en priorite",
        body:
          "Comparez d abord l adequation au besoin, ensuite la lisibilite de l offre, puis les specs techniques vraiment utiles. Sur un lave-linge : capacite, bruit, essorage, programmes essentiels. Sur un seche-linge : technologie, bruit, capacite, duree des cycles. Sur un frigo : format, volume, bruit, organisation. Trop de specs secondaires noient la decision.",
      },
      {
        title: "Quand il vaut mieux attendre",
        body:
          "Si les fiches sont pauvres, les garanties floues, les dimensions absentes ou les marchands peu lisibles, la meilleure decision peut etre de ne pas acheter tout de suite. Un bon achat se reconnait aussi au niveau de clarte que vous avez avant validation.",
      },
    ],
  },
  {
    id: "g3",
    title: "Comment choisir un smartphone, une tablette ou un PC",
    desc: "Les vrais arbitrages en telephonie et informatique grand public.",
    progress: 0,
    lessons: 6,
    icon: "💻",
    difficulty: "Intermediaire",
    duration: "24 min",
    content: [
      {
        title: "Smartphone : les 5 points qui comptent",
        body:
          "Pour la plupart des acheteurs, les vrais sujets sont l autonomie, la fluidite generale, la photo, le stockage et la duree de vie logicielle. Beaucoup de fiches surjouent la performance brute, alors que le confort quotidien depend souvent d un ensemble plus simple. Commencez par vos usages dominants : photo, messagerie, travail, video, jeu ou simplicite.",
      },
      {
        title: "Tablette : usage de salon, etudes ou travail",
        body:
          "Une tablette pertinente depend surtout de l usage. Media et lecture, prise de notes, dessin, travail mobile ou equipement familial n impliquent pas les memes choix. Ecran, autonomie, poids, ecosysteme d accessoires et stockage deviennent vite plus utiles que des arguments de puissance pure.",
      },
      {
        title: "PC portable : ne pas se tromper de configuration",
        body:
          "Le trio processeur, memoire vive et stockage doit etre lu avec le type d usage en tete. Un PC pour bureautique n a pas les memes besoins qu un PC pour etudes creatives ou jeux video. La qualite de l ecran, le bruit, l autonomie et la reparabilite percue comptent souvent autant que la fiche technique brute.",
      },
      {
        title: "Les specs a lire sans se faire pieger",
        body:
          "Une reference peut afficher beaucoup de donnees techniques et rester peu lisible. Le bon reflexe est de distinguer les specs structurantes des specs decoratives. MAREF doit vous aider a repondre a une question simple : cette configuration est-elle coherente pour mon usage, mon budget et mon horizon de conservation ?",
      },
      {
        title: "Le role de la marque et de l ecosysteme",
        body:
          "La marque ne doit pas decider seule, mais elle compte quand elle change l experience globale : duree logicielle, accessoires, service, revente, compatibilite et confort de transition. Le bon arbitrage consiste a voir si cet ecosysteme apporte une vraie valeur ou seulement un surcout symbolique.",
      },
      {
        title: "Quand le reconditionne peut etre pertinent",
        body:
          "Le reconditionne peut etre tres interessant si la garantie, l etat, le vendeur et la traçabilite sont lisibles. Il ne faut pas l accepter comme une simple reduction de prix, mais comme un arbitrage entre economie et niveau de risque acceptable. Si le cadre n est pas suffisamment propre, il vaut mieux rester prudent.",
      },
    ],
  },
  {
    id: "g4",
    title: "Comment lire le score MAREF et les axes PEFAS",
    desc: "Utiliser le score comme un outil d arbitrage, pas comme une note magique.",
    progress: 0,
    lessons: 5,
    icon: "📊",
    difficulty: "Intermediaire",
    duration: "17 min",
    content: [
      {
        title: "A quoi sert le score",
        body:
          "Le score MAREF sert a prioriser et a clarifier. Il ne remplace jamais la lecture des axes ou des limites de donnees. Une bonne pratique consiste a prendre les deux ou trois meilleures references, puis a lire ce qui les separe reellement.",
      },
      {
        title: "Pertinence et Economie",
        body:
          "La Pertinence mesure l adequation au besoin et au projet. L Economie regarde la valeur rendue face au prix et au cout probable. Un produit peu cher peut rester faible en Economie s il est mal dimensionne ou peu durable.",
      },
      {
        title: "Fluidite et Assurance",
        body:
          "La Fluidite regarde la qualite pratique de l achat : lisibilite, disponibilite, friction, experience marchande. L Assurance regarde la confiance, la garantie et la solidite du cadre de vente. Ces axes deviennent decisifs quand deux produits sont tres proches sur le reste.",
      },
      {
        title: "Stabilite",
        body:
          "La Stabilite vous aide a lire la robustesse percue dans le temps : coherence de l offre, marque, horizon d usage et qualite des signaux disponibles. Sur les achats gardes plusieurs annees, cet axe prend beaucoup de valeur.",
      },
      {
        title: "Quand il faut dire score indisponible",
        body:
          "Un produit sans donnees suffisantes ne doit pas recevoir une illusion de precision. MAREF doit savoir dire stop, score indisponible ou analyse partielle. Cette honnetete renforce la confiance utilisateur bien plus qu une pseudo-note automatique.",
      },
    ],
  },
  {
    id: "g5",
    title: "Comparer 2 a 3 references sans vous perdre",
    desc: "La bonne methode pour passer de la short-list a la decision.",
    progress: 0,
    lessons: 5,
    icon: "⚖️",
    difficulty: "Intermediaire",
    duration: "16 min",
    content: [
      {
        title: "Pourquoi 3 produits maximum",
        body:
          "Au-dela de trois produits comparables dans la meme sous-categorie, la lisibilite chute tres vite. Il devient plus difficile de comprendre les vrais ecarts et de garder un raisonnement propre. La bonne pratique consiste a garder un choix prudent, un choix equilibre et un choix ambitieux.",
      },
      {
        title: "Comparer les axes avant les specs",
        body:
          "Le premier niveau de lecture, c est PEFAS. Le deuxieme, ce sont les donnees techniques qui justifient les ecarts. Le troisieme, c est le prix, la garantie et le cadre marchand. Cet ordre vous evite de vous noyer dans des details peu decisifs.",
      },
      {
        title: "Comparer les donnees techniques utiles",
        body:
          "Une comparaison technique doit mettre en avant seulement ce qui est utile a la decision : dimensions, autonomie, capacite, bruit, memoire, connectique, technologie de sechage, etc. Les specs redondantes ou purement marketing doivent etre releguees au second plan.",
      },
      {
        title: "Lire les signaux faibles",
        body:
          "Quand deux offres sont proches, le bon reflexe est de lire les signaux faibles : clarté de la fiche, garantie, marchand, disponibilité, cohérence des données et confiance générale. Ces points font souvent la différence dans une vraie décision d achat.",
      },
      {
        title: "Passer a l arbitrage final",
        body:
          "L arbitrage final ne doit jamais ressembler a une loterie. Vous devez savoir pourquoi le produit recommandé l emporte : meilleur équilibre global, meilleur rapport besoin/prix, meilleure lisibilité marchande ou meilleure tenue dans le temps. Si vous ne savez pas l expliquer, la décision n est pas encore prête.",
      },
    ],
  },
];

export const GUIDE_QUIZZES: GuideQuiz[] = [
  {
    id: "q1",
    title: "Cadrer son besoin avant d acheter",
    questions: [
      {
        q: "Quel est le meilleur point de depart avant toute comparaison ?",
        options: ["La marque la plus connue", "Le besoin reel et les contraintes", "Le plus gros rabais", "Le produit le plus populaire"],
        correct: 1,
        explanation: "Une comparaison propre commence par un besoin clair, pas par un reflexe de marque ou de promo.",
      },
      {
        q: "Combien de criteres non negociables faut-il idealement definir au debut ?",
        options: ["Un seul", "Deux ou trois", "Huit ou neuf", "Le plus possible"],
        correct: 1,
        explanation: "Deux ou trois criteres forts suffisent a cadrer une decision sans la rigidifier.",
      },
      {
        q: "Pourquoi utiliser une fourchette budget plutot qu un seul montant ?",
        options: ["Pour acheter plus vite", "Pour accepter n importe quel prix", "Pour mieux arbitrer la valeur reelle", "Parce que les prix ne servent pas"],
        correct: 2,
        explanation: "Une fourchette aide a juger si un surcout apporte une vraie valeur ou non.",
      },
      {
        q: "Quel exemple correspond a une contrainte de contexte pertinente ?",
        options: ["La couleur de l emballage", "Les dimensions du logement", "Le slogan du marchand", "Le nombre d etoiles marketing"],
        correct: 1,
        explanation: "Les contraintes physiques et d usage changent directement la pertinence du produit.",
      },
      {
        q: "Quand un projet MAREF devient-il vraiment utile ?",
        options: ["Quand vous avez 20 onglets ouverts", "Quand votre besoin tient en une phrase claire", "Quand vous avez choisi un vendeur", "Quand vous avez lu 100 avis"],
        correct: 1,
        explanation: "Un projet sert a cadrer proprement l intention d achat pour que l analyse reste utile.",
      },
    ],
  },
  {
    id: "q2",
    title: "Choisir un appareil du quotidien",
    questions: [
      {
        q: "Pour un lave-linge, quel critere est generalement structurant ?",
        options: ["Le nom marketing", "La couleur de facade", "La capacite adaptee au foyer", "Le nombre de slogans sur la fiche"],
        correct: 2,
        explanation: "La capacite fait partie des premiers criteres de pertinence avec le bruit, l encombrement et l usage.",
      },
      {
        q: "Pour un seche-linge, la technologie doit etre comparee avec :",
        options: ["La taille du logo", "Le prix uniquement", "La capacite, le bruit et le temps de cycle", "La couleur du site marchand"],
        correct: 2,
        explanation: "La technologie seule ne suffit pas. Elle doit etre lue avec l usage et les contraintes du foyer.",
      },
      {
        q: "Pour un refrigerateur, quel point est souvent sous-estime ?",
        options: ["L organisation interieure", "Le nom complet du vendeur", "La mise en avant commerciale", "Le nombre d avis sans contexte"],
        correct: 0,
        explanation: "Le format et l organisation interieure changent fortement l usage quotidien.",
      },
      {
        q: "Pour un smartphone, quel trio revient tres souvent dans la vraie decision ?",
        options: ["Packaging, slogan, couleur", "Autonomie, fluidite, stockage", "Promo, promo, promo", "Influenceurs, tendance, hype"],
        correct: 1,
        explanation: "Ces criteres structurent le confort quotidien bien plus que beaucoup de specs mises en avant.",
      },
      {
        q: "Quand faut-il ralentir la decision ?",
        options: ["Quand tout est parfaitement clair", "Quand les fiches sont pauvres ou les garanties floues", "Quand le produit vous plait", "Quand le prix baisse legerement"],
        correct: 1,
        explanation: "Une offre mal documentee doit augmenter votre vigilance, pas la faire disparaitre.",
      },
    ],
  },
  {
    id: "q3",
    title: "Score MAREF et PEFAS",
    questions: [
      {
        q: "Le score MAREF sert d abord a :",
        options: ["Remplacer le jugement", "Trier puis approfondir", "Choisir le plus vendu", "Acheter plus vite"],
        correct: 1,
        explanation: "Le score aide a prioriser. La vraie decision vient ensuite avec la lecture des axes et des donnees.",
      },
      {
        q: "Que mesure l axe P ?",
        options: ["Pertinence", "Popularite", "Precision", "Puissance"],
        correct: 0,
        explanation: "P signifie Pertinence, c est-a-dire l adequation au besoin et au projet.",
      },
      {
        q: "Que faut-il faire quand les donnees sont insuffisantes ?",
        options: ["Inventer une note", "Afficher score indisponible ou analyse partielle", "Copier un score voisin", "Masquer le manque de donnees"],
        correct: 1,
        explanation: "L honnetete sur la limite de donnees vaut mieux qu une fausse precision.",
      },
      {
        q: "L axe Assurance aide surtout a lire :",
        options: ["La confiance marchande et la garantie", "La couleur du produit", "Sa popularite sur les reseaux", "Le style marketing"],
        correct: 0,
        explanation: "L Assurance concerne la solidite du cadre d achat et la confiance raisonnable dans l offre.",
      },
      {
        q: "Pourquoi lire les axes apres le score ?",
        options: ["Parce qu ils sont decoratifs", "Parce qu ils expliquent le pourquoi de la recommandation", "Parce qu ils remplacent le prix", "Parce qu ils sont toujours identiques"],
        correct: 1,
        explanation: "Les axes servent a comprendre les forces, les limites et les compromis reellement presents.",
      },
    ],
  },
  {
    id: "q4",
    title: "Comparer et arbitrer",
    questions: [
      {
        q: "Combien de produits faut-il idealement comparer dans une meme sous-categorie ?",
        options: ["1", "2 ou 3", "7 ou 8", "Le plus possible"],
        correct: 1,
        explanation: "Deux ou trois references suffisent pour une comparaison lisible et solide.",
      },
      {
        q: "Quel est le bon ordre de lecture ?",
        options: ["Promo, couleur, design", "Axes, donnees techniques, prix, risques", "Avis reseaux, packaging, logo", "Design, slogan, marque"],
        correct: 1,
        explanation: "Commencer par les axes puis les donnees utiles rend l arbitrage plus propre.",
      },
      {
        q: "Quand deux produits sont proches, quel signal devient utile ?",
        options: ["Le slogan", "La lisibilite de l offre et le risque marchand", "Le packaging", "Le nombre d emojis"],
        correct: 1,
        explanation: "Les signaux faibles comme la clarté des donnees et la garantie deviennent decisifs.",
      },
      {
        q: "Le meilleur produit est :",
        options: ["Toujours le plus cher", "Toujours le moins cher", "Celui qui colle le mieux au contexte", "Toujours le plus connu"],
        correct: 2,
        explanation: "Il n existe pas de meilleur produit absolu. Il existe un meilleur choix pour un contexte donne.",
      },
      {
        q: "Si vous n arrivez pas a expliquer la recommandation, cela veut dire :",
        options: ["La decision est solide", "La comparaison est probablement encore immature", "Le score ne sert a rien", "Il faut acheter vite"],
        correct: 1,
        explanation: "Une bonne recommandation doit pouvoir s expliquer simplement et clairement.",
      },
    ],
  },
];
