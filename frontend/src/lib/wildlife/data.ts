export type Species = "Elephant" | "Tiger" | "Rhino";
export type Behavior = "Grazing" | "Resting" | "Sleeping" | "Walking" | "Running";
export type AlertLevel = "info" | "warning" | "critical";

export interface Animal {
  id: string;
  code: string;
  name: string;
  species: Species;
  age: number;
  sex: "M" | "F";
  collarBattery: number;
  signal: number;
  position: [number, number]; // [lat, lng]
  behavior: Behavior;
  behaviorSinceMin: number;
  heartRate: number;
  pregnancyProb?: number;
  riskScore: number;
  insideGeofence: boolean;
  lastSeen: string;
}

export interface AlertItem {
  id: string;
  animalCode: string;
  type: "GEOFENCE_BREACH" | "POACHING_SUSPECT" | "PREGNANCY_SIGNAL" | "LOW_BATTERY" | "ABNORMAL_REST" | "HIGH_STRESS";
  level: AlertLevel;
  message: string;
  channel: ("SMS" | "WhatsApp")[];
  recipients: string[];
  timestamp: string;
  acknowledged: boolean;
}

// Kaziranga-style reserve coordinates (Assam, India)
export const RESERVE_CENTER: [number, number] = [26.578, 93.171];

export const GEOFENCE_POLYGON: [number, number][] = [
  [26.612, 93.12],
  [26.618, 93.18],
  [26.6, 93.225],
  [26.555, 93.235],
  [26.535, 93.2],
  [26.542, 93.14],
  [26.575, 93.108],
];

export const BUFFER_POLYGON: [number, number][] = [
  [26.628, 93.105],
  [26.635, 93.195],
  [26.612, 93.248],
  [26.545, 93.258],
  [26.518, 93.215],
  [26.525, 93.125],
  [26.572, 93.09],
];

export const ANIMALS: Animal[] = [
  {
    id: "1",
    code: "ELE-014",
    name: "Ananya",
    species: "Elephant",
    age: 27,
    sex: "F",
    collarBattery: 82,
    signal: 94,
    position: [26.585, 93.168],
    behavior: "Grazing",
    behaviorSinceMin: 47,
    heartRate: 32,
    pregnancyProb: 0.78,
    riskScore: 22,
    insideGeofence: true,
    lastSeen: "12s ago",
  },
  {
    id: "2",
    code: "ELE-021",
    name: "Bahubali",
    species: "Elephant",
    age: 41,
    sex: "M",
    collarBattery: 67,
    signal: 88,
    position: [26.572, 93.198],
    behavior: "Walking",
    behaviorSinceMin: 12,
    heartRate: 41,
    riskScore: 38,
    insideGeofence: true,
    lastSeen: "8s ago",
  },
  {
    id: "3",
    code: "TGR-007",
    name: "Machhli",
    species: "Tiger",
    age: 9,
    sex: "F",
    collarBattery: 54,
    signal: 71,
    position: [26.598, 93.149],
    behavior: "Resting",
    behaviorSinceMin: 138,
    heartRate: 58,
    pregnancyProb: 0.41,
    riskScore: 19,
    insideGeofence: true,
    lastSeen: "21s ago",
  },
  {
    id: "4",
    code: "TGR-012",
    name: "Sher Khan",
    species: "Tiger",
    age: 6,
    sex: "M",
    collarBattery: 38,
    signal: 62,
    position: [26.547, 93.218],
    behavior: "Running",
    behaviorSinceMin: 4,
    heartRate: 102,
    riskScore: 81,
    insideGeofence: true,
    lastSeen: "3s ago",
  },
  {
    id: "5",
    code: "RHN-003",
    name: "Durga",
    species: "Rhino",
    age: 18,
    sex: "F",
    collarBattery: 71,
    signal: 83,
    position: [26.561, 93.182],
    behavior: "Grazing",
    behaviorSinceMin: 64,
    heartRate: 38,
    pregnancyProb: 0.62,
    riskScore: 14,
    insideGeofence: true,
    lastSeen: "5s ago",
  },
  {
    id: "6",
    code: "RHN-008",
    name: "Vikram",
    species: "Rhino",
    age: 14,
    sex: "M",
    collarBattery: 23,
    signal: 44,
    position: [26.622, 93.232],
    behavior: "Sleeping",
    behaviorSinceMin: 412,
    heartRate: 28,
    riskScore: 74,
    insideGeofence: false,
    lastSeen: "1m ago",
  },
  {
    id: "7",
    code: "ELE-033",
    name: "Ganesh",
    species: "Elephant",
    age: 33,
    sex: "M",
    collarBattery: 91,
    signal: 96,
    position: [26.566, 93.155],
    behavior: "Walking",
    behaviorSinceMin: 22,
    heartRate: 44,
    riskScore: 28,
    insideGeofence: true,
    lastSeen: "6s ago",
  },
];

export const ALERTS: AlertItem[] = [
  {
    id: "a1",
    animalCode: "RHN-008",
    type: "GEOFENCE_BREACH",
    level: "critical",
    message: "Vikram (RHN-008) crossed the eastern boundary into the buffer zone.",
    channel: ["SMS", "WhatsApp"],
    recipients: ["Ranger Unit 4", "Village Bokakhat"],
    timestamp: "2 min ago",
    acknowledged: false,
  },
  {
    id: "a2",
    animalCode: "RHN-008",
    type: "ABNORMAL_REST",
    level: "critical",
    message: "Rest duration 6h 52m exceeds species baseline. Possible sedation — poaching watch.",
    channel: ["SMS", "WhatsApp"],
    recipients: ["Anti-Poaching Squad"],
    timestamp: "4 min ago",
    acknowledged: false,
  },
  {
    id: "a3",
    animalCode: "TGR-012",
    type: "HIGH_STRESS",
    level: "warning",
    message: "Sher Khan running with HR 102 bpm — sustained flight response detected.",
    channel: ["SMS"],
    recipients: ["Ranger Unit 2"],
    timestamp: "7 min ago",
    acknowledged: false,
  },
  {
    id: "a4",
    animalCode: "ELE-014",
    type: "PREGNANCY_SIGNAL",
    level: "info",
    message: "Ananya behavioural pattern matches late-stage pregnancy (78% confidence).",
    channel: ["WhatsApp"],
    recipients: ["Vet Team"],
    timestamp: "22 min ago",
    acknowledged: true,
  },
  {
    id: "a5",
    animalCode: "RHN-008",
    type: "LOW_BATTERY",
    level: "warning",
    message: "Collar battery at 23%. Schedule recapture within 5 days.",
    channel: ["SMS"],
    recipients: ["Field Ops"],
    timestamp: "38 min ago",
    acknowledged: true,
  },
];

export const SPECIES_COLOR: Record<Species, string> = {
  Elephant: "oklch(0.78 0.15 75)",
  Tiger: "oklch(0.68 0.22 35)",
  Rhino: "oklch(0.72 0.16 155)",
};

export const BEHAVIOR_BASELINE: Record<Species, Record<Behavior, number>> = {
  Elephant: { Grazing: 55, Walking: 25, Resting: 12, Sleeping: 6, Running: 2 },
  Tiger: { Grazing: 0, Walking: 30, Resting: 40, Sleeping: 25, Running: 5 },
  Rhino: { Grazing: 60, Walking: 20, Resting: 15, Sleeping: 4, Running: 1 },
};