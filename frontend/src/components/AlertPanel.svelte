<script>
  export let alerts;
  const LEVEL_COLORS = ['text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];
  const LEVEL_LABELS = ['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'];
</script>

<div class="p-4">
  <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-3">Recent Alerts</h2>
  {#each ($alerts ?? []).slice(0, 20) as alert}
    <div class="mb-2 p-2 rounded bg-gray-800 border border-gray-700">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold {LEVEL_COLORS[alert.alert_level]}">
          {LEVEL_LABELS[alert.alert_level]}
        </span>
        <span class="text-xs text-gray-500">{alert.animal_id}</span>
      </div>
      <div class="text-xs text-gray-400 mt-1">Risk: {alert.risk_score}/100 · {alert.deterrent_activated}</div>
    </div>
  {:else}
    <p class="text-xs text-gray-600">No alerts in last 24h</p>
  {/each}
</div>
