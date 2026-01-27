<script setup lang="ts">
import { ref } from 'vue'
import { ScatterChart, type ScatterChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: ScatterChartDatum[] = [
  { x: 10, y: 20 },
  { x: 30, y: 80 },
  { x: 50, y: 40 },
  { x: 70, y: 60 }
]

const customData: ScatterChartDatum[] = [
  { x: 5, y: 30, size: 6, color: '#2563eb' },
  { x: 15, y: 10, size: 8, color: '#22c55e' },
  { x: 25, y: 80, size: 10, color: '#f97316' },
  { x: 35, y: 50, size: 12, color: '#a855f7' }
]

const interactiveData: ScatterChartDatum[] = [
  { x: 10, y: 25, label: 'Point A' },
  { x: 25, y: 60, label: 'Point B' },
  { x: 40, y: 35, label: 'Point C' },
  { x: 55, y: 75, label: 'Point D' },
  { x: 70, y: 45, label: 'Point E' }
]

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)

const basicSnippet = `<ScatterChart
  :data="data"
  :width="420"
  :height="240"
  x-axis-label="X"
  y-axis-label="Y"
/>`

const customSnippet = `<ScatterChart
  :data="customData"
  :width="420"
  :height="240"
  includeZero
  :pointOpacity="0.8"
  grid-line-style="dotted"
  :show-y-axis="false"
/>`

const hoverableSnippet = `<ScatterChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  v-model:hoveredIndex="hoveredIndex"
/>`

const selectableSnippet = `<ScatterChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  selectable
  v-model:selectedIndex="selectedIndex"
/>`

const tooltipSnippet = `<ScatterChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  show-tooltip
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">ScatterChart 散点图</h1>
      <p class="text-gray-600">用于展示二维数值分布。</p>
    </div>

    <DemoBlock title="基础用法"
               description="默认线性比例尺与坐标轴。"
               :code="basicSnippet">
      <ScatterChart :data="basicData"
                    :width="420"
                    :height="240"
                    x-axis-label="X"
                    y-axis-label="Y" />
    </DemoBlock>

    <DemoBlock title="自定义样式"
               description="控制点大小、透明度与网格样式。"
               :code="customSnippet">
      <ScatterChart :data="customData"
                    :width="420"
                    :height="240"
                    includeZero
                    :pointOpacity="0.8"
                    grid-line-style="dotted"
                    :show-y-axis="false" />
    </DemoBlock>

    <DemoBlock title="悬停高亮"
               description="启用 hoverable 后，鼠标悬停时高亮数据点。"
               :code="hoverableSnippet">
      <div class="space-y-4">
        <ScatterChart :data="interactiveData"
                      :width="420"
                      :height="240"
                      hoverable
                      v-model:hoveredIndex="hoveredIndex" />
        <p class="text-sm text-gray-500">
          当前悬停: {{ hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="点击选中"
               description="启用 selectable 后，点击可选中数据点。"
               :code="selectableSnippet">
      <div class="space-y-4">
        <ScatterChart :data="interactiveData"
                      :width="420"
                      :height="240"
                      hoverable
                      selectable
                      v-model:selectedIndex="selectedIndex" />
        <p class="text-sm text-gray-500">
          选中: {{ selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="显示提示框"
               description="通过 show-tooltip 在悬停时显示坐标信息。"
               :code="tooltipSnippet">
      <ScatterChart :data="interactiveData"
                    :width="420"
                    :height="240"
                    hoverable
                    show-tooltip />
    </DemoBlock>
  </div>
</template>
