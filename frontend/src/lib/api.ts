import type { AlertItem, Animal, DashboardStats, Geofence } from "@/lib/wildlife/data";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const WS_BASE = import.meta.env.VITE_WS_URL;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  health: () => get<{ status: string; service: string }>("/api/health"),
  animals: () => get<Animal[]>("/api/animals/"),
  animal: (id: string) =>
    get<{ animal: Animal; recent_movements: unknown[] }>(`/api/animals/${id}`),
  alerts: (hours = 24) => get<AlertItem[]>(`/api/alerts/?hours=${hours}`),
  geofences: () => get<Geofence[]>("/api/geofences/"),
  stats: () => get<DashboardStats>("/api/stats/"),
};

export function liveUrl() {
  if (WS_BASE) {
    return WS_BASE.endsWith("/api/live") ? WS_BASE : `${WS_BASE}/api/live`;
  }

  if (API_BASE) {
    return `${API_BASE.replace(/^http/, "ws")}/api/live`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/live`;
}
