const BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8000';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API POST ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health:      () => get('/api/health'),
  animals:     () => get('/api/animals'),
  animal:      (id) => get(`/api/animals/${id}`),
  prediction:  (id) => get(`/api/predictions/${id}`),
  alerts:      (hours = 24) => get(`/api/alerts?hours=${hours}`),
  geofences:   () => get('/api/geofences'),
  stats:       () => get('/api/stats'),
  triggerAlert:(body) => post('/api/alerts', body),
};
