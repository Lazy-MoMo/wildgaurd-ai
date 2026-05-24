<script>
  export let stats;
</script>

<div class="p-4 border-b border-gray-800">
  <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-3">System Status</h2>
  <div class="grid grid-cols-2 gap-2">
    {#each [
      ['Animals Tracked', $stats?.total_animals_tracked ?? '--', 'text-green-400'],
      ['Alerts 24h',      $stats?.alerts_last_24h ?? '--',        'text-yellow-400'],
      ['High Risk Now',   $stats?.high_risk_animals ?? '--',       'text-orange-400'],
      ['Prevented Today', $stats?.conflicts_prevented_today ?? '--','text-blue-400'],
    ] as [label, val, color]}
      <div class="bg-gray-800 rounded p-2">
        <div class="{color} text-lg font-bold">{val}</div>
        <div class="text-xs text-gray-500">{label}</div>
      </div>
    {/each}
  </div>
</div>
