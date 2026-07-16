<script setup lang="ts">
import { GaugeChart } from '@expcat/tigercat-vue/GaugeChart'

const tooltipFormatter = (value: number) => `当前占用 ${value}%`
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div>
      <p class="mb-1 text-sm text-gray-500">默认 135°–405° 完整表盘 + gradient</p>
      <GaugeChart :value="72" label="CPU" :width="280" :height="220" :arc-width="22" gradient />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showTooltip + tooltipFormatter</p>
      <GaugeChart
        :value="38"
        label="内存"
        :width="280"
        :height="220"
        show-tooltip
        :tooltip-formatter="tooltipFormatter" />
    </div>
  </div>
</template>
