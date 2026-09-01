<script setup lang="ts">
import { computed } from 'vue'
import {
  createBandScale,
  createLinearScale,
  type ChartCanvasRenderContext
} from '@expcat/tigercat-core'
import { ChartAxis } from '@expcat/tigercat-vue/ChartAxis'
import { ChartCanvas } from '@expcat/tigercat-vue/ChartCanvas'
import { ChartGrid } from '@expcat/tigercat-vue/ChartGrid'
import { ChartLegend } from '@expcat/tigercat-vue/ChartLegend'
import { ChartSeries } from '@expcat/tigercat-vue/ChartSeries'
import { ChartTooltip } from '@expcat/tigercat-vue/ChartTooltip'
import { useChartInteraction } from '@expcat/tigercat-vue'

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

const interaction = useChartInteraction<OrderDatum>({
  hoverable: true,
  selectable: true,
  showTooltip: true,
  activeOpacity: 1,
  inactiveOpacity: 0.35,
  getData: (index) => data[index]
})

function plot(innerRect: ChartCanvasRenderContext['innerRect']) {
  const xScale = createBandScale(
    data.map((item) => item.x),
    [0, innerRect.width],
    { paddingInner: 0.3, paddingOuter: 0.1 }
  )
  const yScale = createLinearScale([0, 100], [innerRect.height, 0])
  return { xScale, yScale }
}

const tooltipContent = computed(() => {
  const i = interaction.resolvedHoveredIndex.value
  return i == null ? '' : `${data[i]?.x}：${data[i]?.y} 单`
})

const legendItems = computed(() => [
  {
    index: 0,
    label: '订单量',
    color: '#2563eb',
    selected: interaction.resolvedSelectedIndex.value === 0
  }
])
</script>

<template>
  <div :class="interaction.wrapperClasses" style="width: min(100%, 360px)">
    <ChartCanvas
      :width="360"
      :height="240"
      title="季度订单量"
      desc="组合原语 + useChartInteraction">
      <template #default="{ innerRect }">
        <ChartGrid
          :x-scale="plot(innerRect).xScale"
          :y-scale="plot(innerRect).yScale"
          :y-tick-values="[0, 25, 50, 75, 100]"
          line-style="dashed" />
        <ChartAxis
          :scale="plot(innerRect).xScale"
          orientation="bottom"
          :y="innerRect.height"
          label="季度" />
        <ChartAxis
          :scale="plot(innerRect).yScale"
          orientation="left"
          :tick-values="[0, 25, 50, 75, 100]"
          label="订单" />
        <ChartSeries :data="data" name="orders" color="#2563eb" type="bar">
          <rect
            v-for="(item, index) in data"
            :key="item.x"
            :x="plot(innerRect).xScale.map(item.x)"
            :y="plot(innerRect).yScale.map(item.y)"
            :width="plot(innerRect).xScale.bandwidth ?? 0"
            :height="innerRect.height - plot(innerRect).yScale.map(item.y)"
            rx="4"
            fill="#2563eb"
            :opacity="interaction.getElementOpacity(index)"
            role="button"
            :tabindex="interaction.resolvedSelectedIndex.value === index ? 0 : -1"
            :aria-label="`${item.x} 订单量 ${item.y}`"
            @mouseenter="interaction.handleMouseEnter(index, $event)"
            @mousemove="interaction.handleMouseMove"
            @mouseleave="interaction.handleMouseLeave"
            @click="interaction.handleClick(index)"
            @keydown="interaction.handleKeyDown($event, index)" />
        </ChartSeries>
      </template>
    </ChartCanvas>
    <ChartLegend
      :items="legendItems"
      interactive
      @item-click="interaction.handleLegendClick"
      @item-hover="interaction.handleLegendHover"
      @item-leave="interaction.handleLegendLeave" />
    <ChartTooltip
      :content="tooltipContent"
      :open="interaction.resolvedHoveredIndex.value != null"
      :x="interaction.tooltipPosition.value.x"
      :y="interaction.tooltipPosition.value.y" />
  </div>
</template>
