<!-- Main dashboard: map + stats + alert panel -->
<script>
  import Map        from '$lib/components/Map.svelte';
  import StatsBar   from '$lib/components/StatsBar.svelte';
  import AlertPanel from '$lib/components/AlertPanel.svelte';
  import { animals, alerts, stats } from '$lib/stores.js';
</script>

<div class="flex h-[calc(100vh-49px)]">
  <!-- Left sidebar: stats + alerts -->
  <aside class="w-80 flex flex-col border-r border-gray-800 bg-gray-900 overflow-y-auto">
    <StatsBar {stats} />
    <AlertPanel {alerts} />
  </aside>

  <!-- Main map area -->
  <div class="flex-1 relative">
    <Map {animals} />
  </div>
</div>
