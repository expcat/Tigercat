<script setup lang="ts">
import { ref } from 'vue'
import { DonutChart, type DonutChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: DonutChartDatum[] = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

const interactiveData: DonutChartDatum[] = [
  { value: 35, label: '产品 A', color: '#2563eb' },
  { value: 28, label: '产品 B', color: '#22c55e' },
  { value: 22, label: '产品 C', color: '#f97316' },
  { value: 15, label: '产品 D', color: '#a855f7' }
]

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)

const donutSnippet = `<DonutChart
  :data="data"
  :width="320"
  :height="220"
  :inner-radius-ratio="0.55"
  :pad-angle="0.02"
  :show-labels="true"
/>`

const hoverableSnippet = `<DonutChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  :show-labels="true"
  v-model:hoveredIndex="hoveredIndex"
/>`

const selectableSnippet = `<DonutChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  selectable
  :show-labels="true"
  v-model:selectedIndex="selectedIndex"
/>`

const legendSnippet = `<DonutChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  show-legend
  legend-position="right"
/>`

const tooltipSnippet = `<DonutChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  show-tooltip
  :show-labels="true"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">DonutChart 环形图</h1>
      <p class="text-gray-600">用于展示分类占比的环形图。</p>
    </div>

    <DemoBlock title="基础用法"
               description="默认环形图与标签。"
               :code="donutSnippet">
      <DonutChart :data="basicData"
                  :width="320"
                  :height="220"
                  :inner-radius-ratio="0.55"
                  :pad-angle="0.02"
                  :show-labels="true" />
    </DemoBlock>

    <DemoBlock title="悬停高亮"
               description="启用 hoverable 后，鼠标悬停时高亮扇区。"
               :code="hoverableSnippet">
      <div class="space-y-4">
        <DonutChart :data="interactiveData"
                    :width="320"
                    :height="220"
                    hoverable
                    :show-labels="true"
                    v-model:hoveredIndex="hoveredIndex" />
        <p class="text-sm text-gray-500">
          当前悬停: {{ hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="点击选中"
               description="启用 selectable 后，点击可选中扇区。"
               :code="selectableSnippet">
      <div class="space-y-4">
        <DonutChart :data="interactiveData"
                    :width="320"
                    :height="220"
                    hoverable
                    selectable
                    :show-labels="true"
                    v-model:selectedIndex="selectedIndex" />
        <p class="text-sm text-gray-500">
          选中: {{ selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="显示图例"
               description="通过 show-legend 显示图例，可设置位置。"
               :code="legendSnippet">
      <DonutChart :data="interactiveData"
                  :width="320"
                  :height="220"
                  hoverable
                  show-legend
                  legend-position="right" />
    </DemoBlock>

    <DemoBlock title="显示提示框"
               description="通过 show-tooltip 在悬停时显示数据提示。"
               :code="tooltipSnippet">
      <DonutChart :data="interactiveData"
                  :width="320"
                  :height="220"
                  hoverable
                  show-tooltip
                  :show-labels="true" />
    </DemoBlock>
  </div>
</template>
