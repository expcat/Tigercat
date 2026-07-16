<script setup lang="ts">
import { computed, ref } from 'vue'
import { createBandScale, createLinearScale } from '@expcat/tigercat-core'
import { ChartAxis } from '@expcat/tigercat-vue/ChartAxis'
import { ChartCanvas } from '@expcat/tigercat-vue/ChartCanvas'
import { ChartGrid } from '@expcat/tigercat-vue/ChartGrid'
import { ChartLegend } from '@expcat/tigercat-vue/ChartLegend'
import { ChartSeries } from '@expcat/tigercat-vue/ChartSeries'
import { ChartTooltip } from '@expcat/tigercat-vue/ChartTooltip'

interface OrderDatum {
  x: string
  y: number
}

const data: OrderDatum[] = [
  { x: 'Q1', y: 42 },
  { x: 'Q2', y: 68 },
  { x: 'Q3', y: 54 },
  { x: 'Q4', y: 86 }
]

const innerWidth = 290
const innerHeight = 180
const xScale = createBandScale(
  data.map((item) => item.x),
  [0, innerWidth],
  { paddingInner: 0.3, paddingOuter: 0.1 }
)
const yScale = createLinearScale([0, 100], [innerHeight, 0])
const active = ref(true)
const tooltip = ref<{ content: string; x: number; y: number } | null>(null)
const legendItems = computed(() => [
  { index: 0, label: '订单量', color: '#2563eb', active: active.value }
])

const showTooltip = (item: OrderDatum, event: MouseEvent) => {
  tooltip.value = {
    content: `${item.x}：${item.y} 单`,
    x: event.clientX,
    y: event.clientY
  }
}
</script>

<template>
  <div style="display: grid; gap: 12px; width: min(100%, 360px)">
    <ChartCanvas
      :width="360"
      :height="240"
      :padding="{ top: 20, right: 20, bottom: 40, left: 50 }"
      title="季度订单量"
      desc="使用 Tigercat 图表底层组件绘制的交互式柱状图"
      style="max-width: 100%; height: auto">
      <ChartGrid
        :x-scale="xScale"
        :y-scale="yScale"
        :y-tick-values="[0, 25, 50, 75, 100]"
        line-style="dashed" />
      <ChartAxis :scale="xScale" orientation="bottom" :y="innerHeight" label="季度" />
      <ChartAxis
        :scale="yScale"
        orientation="left"
        :tick-values="[0, 25, 50, 75, 100]"
        label="订单" />
      <ChartSeries
        :data="data"
        name="orders"
        color="#2563eb"
        type="custom"
        :opacity="active ? 1 : 0.25">
        <template #default="{ data: seriesData, color }">
          <rect
            v-for="item in seriesData"
            :key="item.x"
            :x="xScale.map(item.x)"
            :y="yScale.map(item.y)"
            :width="xScale.bandwidth ?? 0"
            :height="innerHeight - yScale.map(item.y)"
            :fill="color"
            rx="4"
            role="img"
            :aria-label="`${item.x} 订单量 ${item.y}`"
            @mouseenter="showTooltip(item, $event)"
            @mousemove="showTooltip(item, $event)"
            @mouseleave="tooltip = null" />
        </template>
      </ChartSeries>
    </ChartCanvas>

    <ChartLegend
      :items="legendItems"
      interactive
      aria-label="切换图表序列"
      @item-click="active = !active" />
    <ChartTooltip
      :content="tooltip?.content ?? ''"
      :open="Boolean(tooltip)"
      :x="tooltip?.x ?? 0"
      :y="tooltip?.y ?? 0" />
  </div>
</template>
