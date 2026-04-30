<script setup lang="ts">
import { computed } from 'vue'
import { useChartInteraction, Card } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

const snippet = `import { useChartInteraction } from '@expcat/tigercat-vue'

const emits = defineEmits<{
  (e: 'hover', index: number | null, datum: BarDatum | null): void
  (e: 'click', index: number, datum: BarDatum): void
}>()

const interaction = useChartInteraction<BarDatum>({
  hoverable: true,
  selectable: true,
  activeOpacity: 1,
  inactiveOpacity: 0.35,
  emit: emits,
  getData: (i) => data[i]
})

// 模板：在 SVG 元素上绑定事件
<rect v-for="(d, i) in data"
      :opacity="interaction.getElementOpacity(i)"
      @mouseenter="interaction.handleMouseEnter(i, $event)"
      @click="interaction.handleClick(i)" />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">useChartInteraction 图表交互</h1>
      <p class="text-gray-600">
        统一管理图表的悬停高亮、选中态、键盘可达性与图例联动，被内置的 BarChart / LineChart 等组件使用。
      </p>
    </div>

    <DemoBlock title="自定义柱状图"
               description="使用该组合式函数实现自定义图表的悬停高亮和点击选中。"
               :code="snippet">
      <Card>
        <svg viewBox="0 0 400 200"
             class="w-full h-48">
          <g v-for="(d, i) in data"
             :key="d.label">
            <rect :x="20 + i * 70"
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
            <text :x="45 + i * 70"
                  y="195"
                  text-anchor="middle"
                  class="text-xs fill-gray-600">
              {{ d.label }}
            </text>
          </g>
        </svg>
        <div class="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>当前悬停：<strong>{{ activeLabel }}</strong></div>
          <div>当前选中：<strong>{{ selectedLabel }}</strong></div>
        </div>
      </Card>
    </DemoBlock>
  </div>
</template>
