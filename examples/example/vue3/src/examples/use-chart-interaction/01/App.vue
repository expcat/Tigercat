<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
import { ChartLegend } from '@expcat/tigercat-vue/ChartLegend'
import { ChartTooltip } from '@expcat/tigercat-vue/ChartTooltip'
import { useChartInteraction } from '@expcat/tigercat-vue'
import { computed, ref } from 'vue'

interface BarDatum {
  label: string
  value: number
  color: string
}

const data: BarDatum[] = [
  { label: 'A', value: 36, color: '#2563eb' },
  { label: 'B', value: 72, color: '#0ea5e9' },
  { label: 'C', value: 54, color: '#10b981' }
]

const max = Math.max(...data.map((d) => d.value))
const lastClick = ref('无')

const click = useChartInteraction<BarDatum>({
  hoverable: false,
  selectable: false,
  showTooltip: true,
  activeOpacity: 1,
  inactiveOpacity: 0.35,
  getData: (i) => data[i],
  onClick: (_index, datum) => {
    lastClick.value = datum?.label ?? '无'
  }
})

const selected = useChartInteraction<BarDatum>({
  hoverable: true,
  selectable: true,
  activeOpacity: 1,
  inactiveOpacity: 0.35,
  getData: (i) => data[i]
})

const tooltipContent = computed(() => {
  const i = click.resolvedHoveredIndex.value
  return i == null ? '' : `${data[i]?.label}: ${data[i]?.value}`
})

const legendItems = computed(() =>
  data.map((d, i) => ({
    index: i,
    label: d.label,
    color: d.color,
    active: selected.activeIndex.value == null || selected.activeIndex.value === i,
    selected: selected.resolvedSelectedIndex.value === i
  }))
)
</script>

<template>
  <div class="min-w-0">
    <Card>
      <p class="mb-2 text-sm text-[color:var(--tiger-text-secondary)]">
        不设 selectable 仍能 click；悬停只开 tooltip。上次点击：{{ lastClick }}
      </p>
      <svg viewBox="0 0 280 160" class="h-40 w-full">
        <rect
          v-for="(d, i) in data"
          :key="d.label"
          :x="20 + i * 80"
          :y="160 - (d.value / max) * 120"
          width="50"
          :height="(d.value / max) * 120"
          :fill="d.color"
          rx="4"
          :aria-label="`${d.label}: ${d.value}`"
          class="cursor-pointer"
          @mouseenter="click.handleMouseEnter(i, $event)"
          @mousemove="click.handleMouseMove"
          @mouseleave="click.handleMouseLeave"
          @click="click.handleClick(i)" />
      </svg>
      <ChartTooltip
        :content="tooltipContent"
        :open="click.resolvedHoveredIndex.value != null"
        :x="click.tooltipPosition.value.x"
        :y="click.tooltipPosition.value.y" />
    </Card>
    <Card>
      <p class="mb-2 text-sm text-[color:var(--tiger-text-secondary)]">
        图例 hover 与点选走同一套 hook。
      </p>
      <svg viewBox="0 0 280 160" class="h-40 w-full">
        <rect
          v-for="(d, i) in data"
          :key="d.label"
          :x="20 + i * 80"
          :y="160 - (d.value / max) * 120"
          width="50"
          :height="(d.value / max) * 120"
          :fill="d.color"
          :opacity="selected.getElementOpacity(i)"
          rx="4"
          :tabindex="selected.resolvedSelectedIndex.value === i ? 0 : -1"
          role="button"
          :aria-label="`${d.label}: ${d.value}`"
          class="cursor-pointer"
          @mouseenter="selected.handleMouseEnter(i, $event)"
          @mouseleave="selected.handleMouseLeave"
          @click="selected.handleClick(i)"
          @keydown="selected.handleKeyDown($event, i)" />
      </svg>
      <ChartLegend
        :items="legendItems"
        interactive
        @item-click="selected.handleLegendClick"
        @item-hover="selected.handleLegendHover"
        @item-leave="selected.handleLegendLeave" />
    </Card>
  </div>
</template>
