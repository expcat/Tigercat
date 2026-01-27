<script setup lang="ts">
import { ref } from 'vue'
import { PieChart, type PieChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: PieChartDatum[] = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

const donutData: PieChartDatum[] = [
  { value: 320, label: 'Q1' },
  { value: 280, label: 'Q2' },
  { value: 360, label: 'Q3' },
  { value: 420, label: 'Q4' }
]

const interactiveData: PieChartDatum[] = [
  { value: 35, label: '产品 A', color: '#2563eb' },
  { value: 28, label: '产品 B', color: '#22c55e' },
  { value: 22, label: '产品 C', color: '#f97316' },
  { value: 15, label: '产品 D', color: '#a855f7' }
]

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const clickedSlice = ref<string>('')

const handleSliceClick = (datum: PieChartDatum, index: number) => {
  clickedSlice.value = `点击了 ${datum.label}，占比 ${datum.value}%`
}

const basicSnippet = `<PieChart
  :data="data"
  :width="320"
  :height="220"
  :show-labels="true"
/>`

const donutSnippet = `<PieChart
  :data="donutData"
  :width="320"
  :height="220"
  :inner-radius="60"
  :pad-angle="0.02"
  :show-labels="true"
/>`

const hoverableSnippet = `<PieChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  :show-labels="true"
  v-model:hoveredIndex="hoveredIndex"
/>`

const selectableSnippet = `<PieChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  selectable
  :show-labels="true"
  v-model:selectedIndex="selectedIndex"
  @slice-click="handleSliceClick"
/>`

const legendSnippet = `<PieChart
  :data="data"
  :width="320"
  :height="220"
  hoverable
  show-legend
  legend-position="right"
/>`

const tooltipSnippet = `<PieChart
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
      <h1 class="text-3xl font-bold mb-2">PieChart 饼图</h1>
      <p class="text-gray-600">用于展示分类占比。</p>
    </div>

    <DemoBlock title="基础用法"
               description="默认饼图与标签。"
               :code="basicSnippet">
      <PieChart :data="basicData"
                :width="320"
                :height="220"
                :show-labels="true" />
    </DemoBlock>

    <DemoBlock title="环形图"
               description="通过内半径渲染环形图。"
               :code="donutSnippet">
      <PieChart :data="donutData"
                :width="320"
                :height="220"
                :inner-radius="60"
                :pad-angle="0.02"
                :show-labels="true" />
    </DemoBlock>

    <DemoBlock title="悬停高亮"
               description="启用 hoverable 后，鼠标悬停时高亮扇区。"
               :code="hoverableSnippet">
      <div class="space-y-4">
        <PieChart :data="interactiveData"
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
               description="启用 selectable 后，点击可选中扇区，支持事件回调。"
               :code="selectableSnippet">
      <div class="space-y-4">
        <PieChart :data="interactiveData"
                  :width="320"
                  :height="220"
                  hoverable
                  selectable
                  :show-labels="true"
                  v-model:selectedIndex="selectedIndex"
                  @slice-click="handleSliceClick" />
        <p class="text-sm text-gray-500">
          选中: {{ selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无' }}
          <span v-if="clickedSlice" class="ml-4">{{ clickedSlice }}</span>
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="显示图例"
               description="通过 show-legend 显示图例，可设置位置。"
               :code="legendSnippet">
      <PieChart :data="interactiveData"
                :width="320"
                :height="220"
                hoverable
                show-legend
                legend-position="right" />
    </DemoBlock>

    <DemoBlock title="显示提示框"
               description="通过 show-tooltip 在悬停时显示数据提示。"
               :code="tooltipSnippet">
      <PieChart :data="interactiveData"
                :width="320"
                :height="220"
                hoverable
                show-tooltip
                :show-labels="true" />
    </DemoBlock>
  </div>
</template>
