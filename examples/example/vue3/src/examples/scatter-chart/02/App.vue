<script setup lang="ts">
import { ScatterChart } from '@expcat/tigercat-vue/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-vue'

const data: ScatterChartDatum[] = [
  { x: 10, y: 25 },
  { x: 25, y: 60 },
  { x: 40, y: 35 },
  { x: 55, y: 75 },
  { x: 70, y: 50 }
]
const styles = ['circle', 'square', 'triangle'] as const
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div v-for="pointStyle in styles" :key="pointStyle">
      <p class="mb-1 text-sm text-gray-500">pointStyle="{{ pointStyle }}"</p>
      <ScatterChart
        :data="data"
        :width="240"
        :height="180"
        :point-style="pointStyle"
        :point-size="7"
        point-color="#7c3aed"
        :point-opacity="0.8" />
    </div>
  </div>
</template>
