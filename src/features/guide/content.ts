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
  }[];
};

export const GUIDE_MODULES: GuideModule[] = [
  { id: "g1", title: "Comprendre le Score MAREF", desc: "Comment est calcule le score et pourquoi il differe d une simple note.", progress: 65, lessons: 4, icon: "🎯", difficulty: "Debutant", duration: "10 min", content: ["Le Score MAREF n est pas une simple moyenne. C est une evaluation multi-dimensionnelle qui combine 5 axes ponderes selon votre profil.", "Chaque axe (Pertinence, Economie, Fluidite, Assurance, Stabilite) contribue au score global avec un poids different.", "Le score integre egalement le niveau de confiance des donnees et la fraicheur des informations.", "Un score de 85+ est excellent, 70-84 tres bon, 55-69 correct, en dessous il faut etre vigilant."] },
  { id: "g2", title: "Comprendre PEFAS", desc: "Les 5 axes qui structurent chaque evaluation.", progress: 40, lessons: 5, icon: "📊", difficulty: "Debutant", duration: "15 min", content: ["P = Pertinence : mesure l adequation entre le produit et votre besoin reel.", "E = Economie : evalue le rapport cout total / valeur delivree.", "F = Fluidite : mesure la facilite d acces a l offre.", "A = Assurance : evalue la fiabilite de l ecosysteme.", "S = Stabilite : mesure la constance dans le temps."] },
  { id: "g3", title: "Mieux comparer", desc: "Les erreurs classiques de comparaison et comment les eviter.", progress: 0, lessons: 3, icon: "⚖️", difficulty: "Intermediaire", duration: "12 min", content: ["Comparer uniquement sur le prix est la premiere erreur. Le cout total etendu inclut l usage sur plusieurs annees.", "Les avis en ligne sont souvent biaises. Privilegiez les indicateurs objectifs comme la garantie et le SAV.", "Utilisez la comparaison MAREF pour confronter les offres sur les 5 axes PEFAS simultanement."] },
  { id: "g4", title: "Raisonner long terme", desc: "Pourquoi le prix d achat n est qu une partie du cout reel.", progress: 0, lessons: 4, icon: "🔮", difficulty: "Intermediaire", duration: "15 min", content: ["Le cout total d un appareil = prix d achat + cout d usage annuel x nombre d annees.", "Un appareil moins cher a l achat peut couter plus cher sur 5 ans (energie, reparations).", "La classe energetique a un impact direct sur le cout d usage annuel.", "La durabilite et la qualite de fabrication reduisent le risque de remplacement premature."] },
  { id: "g5", title: "Eviter les erreurs d achat", desc: "Les biais cognitifs qui influencent vos decisions.", progress: 20, lessons: 6, icon: "🛡️", difficulty: "Avance", duration: "20 min", content: ["Le biais d ancrage : le premier prix vu influence votre perception de tous les suivants.", "Le biais de confirmation : vous cherchez les infos qui confirment votre choix initial.", "L effet de rarete : la mention 'derniers stocks' pousse a acheter sans reflechir.", "Le biais du prix barre : une reduction n est pertinente que si le prix initial etait reel.", "L aversion a la perte : la peur de rater une promo est plus forte que le plaisir d un bon achat.", "MAREF vous protege de ces biais en fournissant une analyse objective et structuree."] },
  { id: "g6", title: "Comprendre les marchands", desc: "Comment evaluer la fiabilite d un distributeur.", progress: 0, lessons: 3, icon: "🏪", difficulty: "Debutant", duration: "8 min", content: ["La politique de retour est un indicateur cle : 30 jours minimum est recommande.", "La garantie legale est de 2 ans, mais certains marchands offrent des extensions gratuites.", "Le SAV et la disponibilite du service client sont essentiels en cas de probleme."] },
  { id: "g7", title: "Lire une fiche offre", desc: "Chaque element explique, chaque signal decode.", progress: 80, lessons: 4, icon: "📋", difficulty: "Debutant", duration: "10 min", content: ["Le Score MAREF global est votre premier indicateur. Regardez ensuite le statut associe.", "Les axes PEFAS vous montrent ou l offre excelle et ou elle est plus faible.", "La section Mimo vous donne une interpretation humaine et nuancee du score.", "Les points forts et vigilances sont les elements les plus actionnables de la fiche."] },
];

export const GUIDE_QUIZZES: GuideQuiz[] = [
  { id: "q1", title: "Les bases du Score MAREF", questions: [{ q: "Le Score MAREF evalue :", options: ["Seulement le prix", "La pertinence globale d une offre contextualisee", "La popularite du produit", "La note des utilisateurs"], correct: 1 }, { q: "PEFAS comporte combien d axes ?", options: ["3", "4", "5", "6"], correct: 2 }, { q: "Que signifie le P de PEFAS ?", options: ["Prix", "Performance", "Pertinence", "Precision"], correct: 2 }, { q: "Le cout total etendu inclut :", options: ["Seulement le prix d achat", "Le prix + la livraison", "Le prix + usage + couts indirects", "Le prix barre"], correct: 2 }, { q: "Mimo est :", options: ["Un chatbot generique", "Une mascotte", "La couche d interpretation du moteur", "Un comparateur de prix"], correct: 2 }] },
  { id: "q2", title: "Comparer efficacement", questions: [{ q: "Comparer uniquement sur le prix est :", options: ["Suffisant", "Risque car incomplet", "La meilleure methode", "Inutile"], correct: 1 }, { q: "La Fluidite dans PEFAS mesure :", options: ["La vitesse du produit", "La facilite d acces et de livraison", "Le design", "La fluidite de l eau"], correct: 1 }, { q: "Un score de confiance Faible signifie :", options: ["Le produit est mauvais", "Les donnees disponibles sont insuffisantes", "Le marchand est frauduleux", "Le prix va augmenter"], correct: 1 }] },
];
