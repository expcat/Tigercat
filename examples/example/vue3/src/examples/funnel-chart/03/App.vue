<script setup lang="ts">
import { FunnelChart } from '@expcat/tigercat-vue/FunnelChart'

const data = [
  { label: '曝光', value: 9000, color: '#2563eb' },
  { label: '点击', value: 4200, color: '#0891b2' },
  { label: '加购', value: 1600, color: '#22c55e' },
  { label: '下单', value: 600, color: '#f59e0b' }
]
</script>

<template>
  <div class="w-full max-w-xl">
    <p class="mb-1 text-sm text-gray-500">逐项 color + responsive + title/desc（SVG 无障碍标注）</p>
    <FunnelChart
      :data="data"
      :height="260"
      responsive
      pinch
      title="转化漏斗"
      desc="从曝光到下单的四段转化流失情况"
      show-tooltip />
  </div>
</template>
