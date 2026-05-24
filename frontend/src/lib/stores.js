import { writable, derived } from 'svelte/store';

export const animals    = writable([]);
export const alerts     = writable([]);
export const geofences  = writable([]);
export const stats      = writable({});
export const selectedAnimal = writable(null);
export const wsConnected    = writable(false);

// Derived: animals with risk_score >= 60
export const highRiskAnimals = derived(animals, $animals =>
  $animals.filter(a => (a.latest_risk_score ?? 0) >= 60)
);
