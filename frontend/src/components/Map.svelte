<!-- Leaflet map with live animal markers, geofence polygons, risk heatmap -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { geofences } from '$lib/stores.js';
  export let animals = [];

  let mapEl, L, map, markersLayer;

  const RISK_COLORS = { 0: '#22c55e', 1: '#eab308', 2: '#f97316', 3: '#ef4444' };

  onMount(async () => {
    // Leaflet loads client-side only
    L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');

    map = L.map(mapEl).setView([27.5289, 84.3564], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    renderMarkers();

    // Draw geofences
    $geofences.forEach(f => {
      L.polygon(f.polygon, { color: '#f59e0b', weight: 2, fillOpacity: 0.05 })
       .addTo(map)
       .bindTooltip(f.name);
    });
  });

  function renderMarkers() {
    markersLayer?.clearLayers();
    animals.forEach(a => {
      const { lat, lng } = a.current_location ?? {};
      if (!lat) return;
      const level = a.latest_alert_level ?? 0;
      const color = RISK_COLORS[level] ?? '#22c55e';
      const marker = L.circleMarker([lat, lng], {
        radius: 10, color, fillColor: color, fillOpacity: 0.8, weight: 2,
      }).bindPopup(`<b>${a.animal_id}</b><br>Risk: ${a.latest_risk_score ?? '--'}/100`);
      markersLayer.addLayer(marker);
    });
  }

  $: if (markersLayer) renderMarkers();
  onDestroy(() => map?.remove());
</script>

<div bind:this={mapEl} class="w-full h-full" />
