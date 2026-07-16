<script setup lang="ts">
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import type { LineChartDatum } from '@expcat/tigercat-vue'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 820 },
  { x: 'Feb', y: 932 },
  { x: 'Mar', y: 901 },
  { x: 'Apr', y: 1290 },
  { x: 'May', y: 1330 }
]

const formatK = (value: number | string) => `${Number(value) / 1000}k`
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">坐标轴标题 + 刻度格式化 + 虚线网格</p>
      <LineChart
        :data="data"
        :width="420"
        :height="220"
        x-axis-label="月份"
        y-axis-label="访问量"
        :y-ticks="4"
        :y-tick-format="formatK"
        grid-line-style="dashed"
        include-zero />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showGrid=false + showYAxis=false（极简折线）</p>
      <LineChart :data="data" :width="420" :height="160" :show-grid="false" :show-y-axis="false" />
    </div>
  </div>
</template>
