import type { CompareGroup, PersistedCompareState } from "@/features/compare/types";
import { supabase } from "./supabase";

type PersistedMimoMessage = {
  role: "user" | "assistant";
  text: string;
  projectId: string | null;
  createdAt: string;
  source?: "ai" | "local";
};

type UserProfileMemoryRow = {
  compare_state?: PersistedCompareState | null;
  mimo_memory?: PersistedMimoMessage[] | null;
};

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function normalizeCompareGroups(groups: CompareGroup[]) {
  return groups.map((group) => ({
    ...group,
    offerIds: Array.from(new Set((group.offerIds || []).map((id) => String(id)))).slice(0, 3),
    updatedAt: group.updatedAt || new Date().toISOString(),
  }));
}

export async function loadPersistedCompareState(): Promise<PersistedCompareState | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("compare_state")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  const row = data as UserProfileMemoryRow;
  if (!row.compare_state || typeof row.compare_state !== "object") return null;

  return {
    groups: normalizeCompareGroups(row.compare_state.groups || []),
    snapshots: row.compare_state.snapshots || {},
    updatedAt: row.compare_state.updatedAt || new Date().toISOString(),
  };
}

export async function savePersistedCompareState(state: PersistedCompareState) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      compare_state: {
        groups: normalizeCompareGroups(state.groups),
        snapshots: state.snapshots || {},
        updatedAt: state.updatedAt || new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return !error;
}

export async function loadPersistedMimoMessages(projectId?: string | null, limit = 16): Promise<PersistedMimoMessage[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("user_profiles")
    .select("mimo_memory")
    .eq("user_id", userId)
    .single();

  if (error || !data) return [];

  const row = data as UserProfileMemoryRow;
  const memory = Array.isArray(row.mimo_memory) ? row.mimo_memory : [];
  const filtered = memory.filter((message) =>
    projectId ? message.projectId === projectId || message.projectId === null : message.projectId === null,
  );

  return filtered.slice(-limit);
}

export async function appendPersistedMimoExchange(input: {
  projectId?: string | null;
  userText: string;
  assistantText: string;
  source: "ai" | "local";
}) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { data } = await supabase
    .from("user_profiles")
    .select("mimo_memory")
    .eq("user_id", userId)
    .single();

  const row = (data || {}) as UserProfileMemoryRow;
  const currentMemory = Array.isArray(row.mimo_memory) ? row.mimo_memory : [];
  const createdAt = new Date().toISOString();
  const nextMemory = [
    ...currentMemory,
    { role: "user", text: input.userText, projectId: input.projectId ?? null, createdAt },
    {
      role: "assistant",
      text: input.assistantText,
      projectId: input.projectId ?? null,
      createdAt: new Date(Date.now() + 1).toISOString(),
      source: input.source,
    },
  ].slice(-60);

  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      mimo_memory: nextMemory,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return !error;
}

export type { PersistedMimoMessage };
