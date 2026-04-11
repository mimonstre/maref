export type CategoryDefinition = {
  id: string;
  name: string;
  icon: string;
  subs: {
    id: string;
    name: string;
    icon: string;
  }[];
};

export type Offer = {
  id: string;
  product: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  merchant: string;
  price: number;
  barredPrice: number | null;
  availability: string;
  delivery: string;
  warranty: string;
  score: number;
  status: string;
  statusColor: string;
  confidence: string;
  freshness: string;
  pefas: {
    P: number;
    E: number;
    F: number;
    A: number;
    S: number;
  };
  mimoShort: string;
  reasons: string[];
  vigilances: string[];
  specs: Record<string, string>;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  offer_id: string | null;
};

export type UserDecisionProfile = {
  budget?: "Serre" | "Modere" | "Confortable" | "Flexible";
  priority?: "Prix" | "Fiabilite" | "Simplicite" | "Performance" | "Durabilite";
  horizon?: "1-2 ans" | "3-5 ans" | "5-8 ans" | "8+ ans";
  usage?: "Usage leger" | "Usage quotidien" | "Usage intensif" | "Usage professionnel";
  risk?: "Prudent" | "Equilibre" | "Audacieux";
};

export type ProjectDecisionContext = {
  projectId?: string;
  projectName?: string;
  projectCategory?: string;
  projectBudget?: string;
  projectObjective?: string;
  existingOffers?: Offer[];
  userProfile?: UserDecisionProfile;
};
