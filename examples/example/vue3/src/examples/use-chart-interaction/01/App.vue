<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
import { computed } from 'vue'
import { useChartInteraction } from '@expcat/tigercat-vue'

interface BarDatum {
  label: string
  value: number
  color: string
}

const data: BarDatum[] = [
  { label: 'A', value: 36, color: '#2563eb' },
  { label: 'B', value: 72, color: '#0ea5e9' },
  { label: 'C', value: 54, color: '#10b981' },
  { label: 'D', value: 88, color: '#f59e0b' },
  { label: 'E', value: 42, color: '#ef4444' }
]

const emits = defineEmits<{
  (e: 'hover', index: number | null, datum: BarDatum | null): void
  (e: 'click', index: number, datum: BarDatum): void
}>()

const interaction = useChartInteraction<BarDatum>({
  hoverable: true,
  selectable: true,
  activeOpacity: 1,
  inactiveOpacity: 0.35,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: emits as unknown as (event: string, ...args: any[]) => void,
  getData: (i) => data[i]
})

const max = Math.max(...data.map((d) => d.value))
const activeLabel = computed(() => {
  const i = interaction.activeIndex.value
  return i == null ? '无' : data[i]?.label
})
const selectedLabel = computed(() => {
  const i = interaction.resolvedSelectedIndex.value
  return i == null ? '无' : data[i]?.label
})
</script>

<template>
  <div class="min-w-0">
    <Card>
      <svg viewBox="0 0 400 200" class="w-full h-48">
        <g v-for="(d, i) in data" :key="d.label">
          <rect
            :x="20 + i * 70"
            :y="200 - (d.value / max) * 160"
            width="50"
            :height="(d.value / max) * 160"
            :fill="d.color"
            :opacity="interaction.getElementOpacity(i)"
            rx="4"
            tabindex="0"
            role="button"
            :aria-label="`${d.label}: ${d.value}`"
            class="cursor-pointer transition-opacity"
            @mouseenter="interaction.handleMouseEnter(i, $event)"
            @mouseleave="interaction.handleMouseLeave"
            @click="interaction.handleClick(i)"
            @keydown="interaction.handleKeyDown($event, i)" />
          <text :x="45 + i * 70" y="195" text-anchor="middle" class="text-xs fill-gray-600">
            {{ d.label }}
          </text>
        </g>
      </svg>
      <div class="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          当前悬停：<strong>{{ activeLabel }}</strong>
        </div>
        <div>
          当前选中：<strong>{{ selectedLabel }}</strong>
        </div>
      </div>
    </Card>
  </div>
</template>
