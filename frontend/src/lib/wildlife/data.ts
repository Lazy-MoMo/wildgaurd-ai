export interface Location {
  lat: number;
  lng: number;
}

export interface Animal {
  _id?: string;
  animal_id: string;
  species: string;
  collar_id: string;
  current_location?: Location;
  last_seen?: string;
  status?: string;
  herd_id?: string | null;
}

export interface AlertItem {
  _id?: string;
  animal_id: string;
  timestamp?: string;
  alert_level?: number;
  risk_score?: number;
  villages_notified?: string[];
  deterrent_activated?: string;
  resolved?: boolean;
}

export interface Geofence {
  _id?: string;
  name: string;
  polygon: [number, number][];
  dynamic?: boolean;
  current_status?: string;
  risk_level?: string;
  context?: {
    season?: string;
    time?: string;
    crop_status?: string;
  };
}

export interface DashboardStats {
  total_animals_tracked?: number;
  alerts_last_24h?: number;
  high_risk_animals?: number;
  conflicts_prevented_today?: number;
  system_uptime?: string;
}

export function documentId(row: { _id?: string }, fallback: string) {
  return row._id ?? fallback;
}

export function alertLevelLabel(level?: number) {
  if (level == null) return "unknown";
  if (level >= 3) return "critical";
  if (level === 2) return "high";
  if (level === 1) return "medium";
  return "low";
}

export function isCriticalAlert(alert: AlertItem) {
  return (alert.alert_level ?? 0) >= 3 && !alert.resolved;
}

export function formatDateTime(value?: string) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleString();
}

export function formatSpecies(value?: string) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function latestAlertFor(animalId: string, alerts: AlertItem[]) {
  return alerts.find((alert) => alert.animal_id === animalId);
}
