<script>
  import { onMount } from 'svelte';
  import { connectWS } from '$lib/websocket.js';
  import { api } from '$lib/api.js';
  import { animals, alerts, geofences, stats } from '$lib/stores.js';
  import '../app.css';

  onMount(async () => {
    // Bootstrap data
    animals.set(await api.animals());
    alerts.set(await api.alerts());
    geofences.set(await api.geofences());
    stats.set(await api.stats());
    // Open WebSocket for live updates
    connectWS();
  });
</script>

<div class="min-h-screen bg-gray-950 text-white flex flex-col">
  <nav class="flex items-center gap-4 px-6 py-3 bg-gray-900 border-b border-gray-800">
    <span class="text-green-400 font-bold text-lg">🐘 WildGuard AI</span>
    <a href="/"          class="text-sm text-gray-400 hover:text-white">Dashboard</a>
    <a href="/animals"   class="text-sm text-gray-400 hover:text-white">Animals</a>
    <a href="/alerts"    class="text-sm text-gray-400 hover:text-white">Alerts</a>
    <a href="/geofences" class="text-sm text-gray-400 hover:text-white">Geofences</a>
  </nav>
  <main class="flex-1">
    <slot />
  </main>
</div>
