import { hasEnoughDataForScore } from "@/lib/core";
import type { Offer } from "@/lib/data";

export const PEFAS_INFO: Record<string, { name: string; desc: string }> = {
  P: { name: "Pertinence", desc: "Adequation entre le produit et votre besoin reel : usage, espace, contraintes techniques, attentes fonctionnelles." },
  E: { name: "Economie", desc: "Rapport entre le cout total (achat + usage + indirect) et la valeur reellement delivree." },
  F: { name: "Fluidite", desc: "Facilite d acces a l offre : disponibilite, delai, livraison, simplicite du parcours, politique de retour." },
  A: { name: "Assurance", desc: "Fiabilite de l ecosysteme : marque, marchand, garantie, SAV, reputation du distributeur." },
  S: { name: "Stabilite", desc: "Constance du produit et de l offre dans le temps : durabilite, historique de prix, fiabilite long terme." },
};

export const SPEC_CATEGORIES: Record<string, string[]> = {
  Performance: ["Capacite", "Volume total", "Volume frigo", "Volume congelateur", "Volume", "Nombre couverts", "Taille ecran", "Resolution", "Technologie", "Processeur", "Moteur"],
  Energie: ["Classe energetique", "Consommation", "Consommation eau", "Consommation energie"],
  Confort: ["Niveau sonore", "Niveau sonore lavage", "Niveau sonore essorage", "Nombre programmes", "Depart differe", "Vapeur", "Sechage", "Type froid", "Degivrage", "Eclairage", "Affichage", "Zone fraicheur", "BioFresh", "Mini bar", "Distributeur eau", "Machine glacons", "Ambilight"],
  "Image & Son": ["HDR", "Taux rafraichissement", "Temps reponse", "Input lag", "Son", "Dolby Atmos", "ALLM", "VRR", "Game Bar"],
  Connectivite: ["Smart TV", "Wifi", "Bluetooth", "HDMI", "USB"],
  Dimensions: ["Dimensions", "Dimensions avec pied", "Largeur", "Poids", "Couleur"],
  Securite: ["Autonomie coupure", "Pouvoir congelation", "Super congelation", "Alarme porte", "Nombre tiroirs", "Nombre clayettes", "Tiroir couverts", "Affichage temps restant"],
};

export const SPEC_ICONS: Record<string, string> = {
  Performance: "⚡",
  Energie: "🔋",
  Confort: "🛋️",
  "Image & Son": "🖥️",
  Connectivite: "📡",
  Dimensions: "📐",
  Securite: "🔒",
  Autres: "📋",
};

export function categorizeSpecs(specs: Record<string, string>): Record<string, [string, string][]> {
  const result: Record<string, [string, string][]> = {};
  const assigned = new Set<string>();

  for (const [categoryName, keys] of Object.entries(SPEC_CATEGORIES)) {
    const items: [string, string][] = [];
    for (const key of keys) {
      if (specs[key]) {
        items.push([key, specs[key]]);
        assigned.add(key);
      }
    }
    if (items.length > 0) result[categoryName] = items;
  }

  const others: [string, string][] = [];
  for (const [key, value] of Object.entries(specs)) {
    if (!assigned.has(key)) others.push([key, value]);
  }
  if (others.length > 0) result.Autres = others;

  return result;
}

export function generateMimoAnalysis(offer: Offer): string {
  if (!hasEnoughDataForScore(offer)) {
    return "Les donnees disponibles sur cette offre sont insuffisantes pour produire une analyse fiable.";
  }

  const strong: string[] = [];
  const weak: string[] = [];

  if (offer.pefas.P >= 75) strong.push("pertinence elevee pour votre profil");
  if (offer.pefas.E >= 75) strong.push("excellent rapport cout/valeur");
  if (offer.pefas.F >= 75) strong.push("acces fluide et conditions favorables");
  if (offer.pefas.A >= 75) strong.push("ecosysteme fiable (marque + marchand)");
  if (offer.pefas.S >= 75) strong.push("bonne stabilite dans le temps");
  if (offer.pefas.P < 55) weak.push("la pertinence pour votre usage est limitee");
  if (offer.pefas.E < 55) weak.push("le rapport cout/valeur est en dessous de la moyenne");
  if (offer.pefas.F < 55) weak.push("les conditions d acces sont contraignantes");
  if (offer.pefas.A < 55) weak.push("la fiabilite de l ecosysteme est incertaine");
  if (offer.pefas.S < 55) weak.push("la stabilite a long terme n est pas garantie");

  let text = offer.brand + " " + offer.product + " dispose de donnees exploitables chez " + offer.merchant + ". ";
  if (strong.length > 0) text += "Points forts : " + strong.join(", ") + ". ";
  if (weak.length > 0) text += "Points d attention : " + weak.join(", ") + ". ";

  const pefasAverage = Math.round((Object.values(offer.pefas).reduce((sum, value) => sum + (value || 0), 0)) / 5);

  if (pefasAverage >= 85) text += "Les axes disponibles placent cette offre parmi les plus solides de sa categorie.";
  else if (pefasAverage >= 72) text += "Les axes disponibles sont globalement favorables, avec quelques points a verifier.";
  else if (pefasAverage >= 58) text += "Le niveau reste moyen : une comparaison reste recommandee.";
  else if (pefasAverage >= 42) text += "Plusieurs indicateurs restent fragiles.";
  else text += "Cette offre presente des faiblesses significatives.";

  return text;
}

export function generateSpecsMimo(specs: Record<string, string>): string {
  const entries = Object.entries(specs);
  if (entries.length === 0) return "Les donnees techniques de ce produit ne sont pas encore disponibles.";

  let text = "Analyse technique : ";
  const highlights: string[] = [];

  if (specs["Classe energetique"]) {
    const energyClass = specs["Classe energetique"];
    if (energyClass === "A" || energyClass === "B") highlights.push("classe energetique " + energyClass + " (excellente)");
    else if (energyClass === "C" || energyClass === "D") highlights.push("classe energetique " + energyClass + " (correcte)");
    else highlights.push("classe energetique " + energyClass + " (a surveiller pour le cout d usage)");
  }
  if (specs["Niveau sonore"] || specs["Niveau sonore lavage"]) {
    const db = parseInt(specs["Niveau sonore"] || specs["Niveau sonore lavage"]);
    if (db <= 40) highlights.push("silence remarquable (" + db + " dB)");
    else if (db <= 50) highlights.push("niveau sonore contenu (" + db + " dB)");
    else highlights.push("niveau sonore notable (" + db + " dB)");
  }
  if (specs["Taux rafraichissement"]) {
    const hz = parseInt(specs["Taux rafraichissement"]);
    if (hz >= 120) highlights.push("fluidite d image excellente (" + hz + " Hz)");
  }
  if (specs["Type froid"]) {
    if (specs["Type froid"].toLowerCase().includes("no frost")) highlights.push("No Frost (pas de degivrage manuel)");
    else if (specs["Type froid"].toLowerCase().includes("ventile")) highlights.push("froid ventile (repartition homogene)");
  }
  if (specs.Resolution && specs.Resolution.includes("4K")) highlights.push("resolution 4K UHD");
  if (specs.HDR && specs.HDR.includes("Dolby Vision")) highlights.push("compatible Dolby Vision");

  if (highlights.length > 0) text += highlights.join(", ") + ". ";
  text += "Ce produit dispose de " + entries.length + " caracteristiques techniques documentees.";

  return text;
}
