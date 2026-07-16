<script setup lang="ts">
import { GaugeChart } from '@expcat/tigercat-vue/GaugeChart'

const percent = (value: number) => `${value}%`
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div>
      <p class="mb-1 text-sm text-gray-500">min/max 自定义量程 + tickCount</p>
      <GaugeChart
        :value="1280"
        :min="0"
        :max="2000"
        :tick-count="5"
        label="转速 (rpm)"
        :width="280"
        :height="200" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showTicks=false + color/trackColor</p>
      <GaugeChart
        :value="64"
        :show-ticks="false"
        color="#7c3aed"
        track-color="#ede9fe"
        label="完成度"
        :width="280"
        :height="200"
        :value-formatter="percent" />
    </div>
  </div>
</template>
