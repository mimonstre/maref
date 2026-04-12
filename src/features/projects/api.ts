import { supabase } from "@/lib/supabase";
import { getOfferDataState, type ProjectDecisionContext } from "@/lib/core";
import type { Offer } from "@/lib/data";

export type Project = {
  id: string;
  name: string;
  category: string;
  budget: string;
  state: string;
  objective: string;
  created_at: string;
};

export type ProjectOffer = Offer;

type ProjectOfferLink = {
  project_id: string;
  offer_id: string;
};

type OfferRow = {
  id: string;
  product: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  merchant: string;
  price: number;
  barred_price: number | null;
  availability: string;
  delivery: string;
  warranty: string;
  score: number;
  status: string;
  status_color: string;
  confidence: string;
  freshness: string;
  source_url?: string | null;
  last_updated?: string | null;
  reliability_score?: number | null;
  pefas_p: number;
  pefas_e: number;
  pefas_f: number;
  pefas_a: number;
  pefas_s: number;
  mimo_short: string;
  reasons: string[];
  vigilances: string[];
  specs?: Record<string, string>;
};

function normalizeAvailability(value: string | null | undefined) {
  if (!value) return "Disponibilite a confirmer";
  if (value.toLowerCase() === "en stock") return "Disponible";
  return value;
}

function mapOffer(row: OfferRow): Offer {
  const offer: Offer = {
    id: row.id,
    product: row.product,
    brand: row.brand,
    model: row.model,
    category: row.category,
    subcategory: row.subcategory,
    merchant: row.merchant,
    price: row.price,
    barredPrice: row.barred_price,
    availability: normalizeAvailability(row.availability),
    delivery: row.delivery,
    warranty: row.warranty,
    score: typeof row.score === "number" ? row.score : null,
    status: row.status || null,
    statusColor: row.status_color || null,
    confidence: row.confidence || null,
    freshness: row.freshness || null,
    sourceUrl: row.source_url || null,
    lastUpdated: row.last_updated || null,
    reliabilityScore: typeof row.reliability_score === "number" ? row.reliability_score : null,
    dataState: "unknown",
    pefas: {
      P: typeof row.pefas_p === "number" ? row.pefas_p : null,
      E: typeof row.pefas_e === "number" ? row.pefas_e : null,
      F: typeof row.pefas_f === "number" ? row.pefas_f : null,
      A: typeof row.pefas_a === "number" ? row.pefas_a : null,
      S: typeof row.pefas_s === "number" ? row.pefas_s : null,
    },
    mimoShort: row.mimo_short || null,
    reasons: row.reasons || [],
    vigilances: row.vigilances || [],
    specs: row.specs || {},
  };

  return {
    ...offer,
    dataState: getOfferDataState(offer),
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  return (data || []) as Project[];
}

export async function getProjectsWithOffers(): Promise<{
  projects: Project[];
  projectOffers: Record<string, ProjectOffer[]>;
}> {
  const { data: projectsData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  const projects = (projectsData || []) as Project[];

  if (projects.length === 0) {
    return { projects: [], projectOffers: {} };
  }

  const projectIds = projects.map((project) => project.id);
  const { data: linksData } = await supabase
    .from("project_offers")
    .select("project_id, offer_id")
    .in("project_id", projectIds);

  const links = (linksData || []) as ProjectOfferLink[];
  const offerIds = [...new Set(links.map((link) => link.offer_id))];
  const projectOffers: Record<string, ProjectOffer[]> = Object.fromEntries(projectIds.map((id) => [id, []]));

  if (offerIds.length === 0) {
    return { projects, projectOffers };
  }

  const { data: offersData } = await supabase
    .from("offers")
    .select("*")
    .in("id", offerIds);

  const offersMap = Object.fromEntries(((offersData || []) as OfferRow[]).map((offer) => [offer.id, mapOffer(offer)]));

  for (const link of links) {
    const offer = offersMap[link.offer_id];
    if (offer) {
      projectOffers[link.project_id].push(offer);
    }
  }

  return { projects, projectOffers };
}

export async function createProject(input: {
  name: string;
  category: string;
  budget: string;
  objective: string;
  userId: string | null;
}) {
  const { error } = await supabase.from("projects").insert({
    name: input.name,
    category: input.category,
    budget: input.budget || "A definir",
    state: "En cours",
    objective: input.objective,
    user_id: input.userId,
  });

  return !error;
}

export async function deleteProject(projectId: string) {
  await supabase.from("project_offers").delete().eq("project_id", projectId);
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  return !error;
}

export async function removeOfferFromProject(projectId: string, offerId: string) {
  const { error } = await supabase.from("project_offers").delete().eq("project_id", projectId).eq("offer_id", offerId);
  return !error;
}

export async function addOfferToProject(projectId: string, offerId: string) {
  const { data: existing } = await supabase
    .from("project_offers")
    .select("id")
    .eq("project_id", projectId)
    .eq("offer_id", offerId);

  if (existing && existing.length > 0) {
    return { success: false, reason: "exists" as const };
  }

  const { error } = await supabase.from("project_offers").insert({ project_id: projectId, offer_id: offerId });

  if (error) {
    return { success: false, reason: "error" as const };
  }

  return { success: true as const };
}

export async function getProjectDecisionContext(projectId: string): Promise<ProjectDecisionContext | null> {
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, category, budget, objective")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const { projects, projectOffers } = await getProjectsWithOffers();
  const currentProject = projects.find((item) => item.id === projectId);
  if (!currentProject) return null;

  return {
    projectId,
    projectName: currentProject.name,
    projectCategory: currentProject.category,
    projectBudget: currentProject.budget,
    projectObjective: currentProject.objective,
    existingOffers: projectOffers[projectId] || [],
  };
}
