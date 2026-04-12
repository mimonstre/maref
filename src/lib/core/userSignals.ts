export type SearchSignal = {
  label: string;
  category?: string | null;
  subcategory?: string | null;
  query?: string | null;
  createdAt: string;
};

export type UserLocation = {
  city: string;
  postalCode: string;
  region: string;
};

const SEARCH_KEY = "maref_recent_searches";
const LOCATION_KEY = "maref_user_location";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getRecentSearchSignals(): SearchSignal[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(SEARCH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchSignal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordSearchSignal(signal: Omit<SearchSignal, "createdAt">) {
  if (!isBrowser()) return;

  const nextSignal: SearchSignal = {
    ...signal,
    createdAt: new Date().toISOString(),
  };

  const normalizedKey = [signal.category || "", signal.subcategory || "", signal.query || "", signal.label]
    .join("|")
    .toLowerCase();

  const existing = getRecentSearchSignals().filter((item) => {
    const key = [item.category || "", item.subcategory || "", item.query || "", item.label].join("|").toLowerCase();
    return key !== normalizedKey;
  });

  window.localStorage.setItem(SEARCH_KEY, JSON.stringify([nextSignal, ...existing].slice(0, 12)));
}

export function getUserLocation(): UserLocation | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserLocation;
  } catch {
    return null;
  }
}

export function saveUserLocation(location: UserLocation) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}
