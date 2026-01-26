<script setup lang="ts">
import { BarChart, type BarChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: BarChartDatum[] = [
  { x: 'Mon', y: 120 },
  { x: 'Tue', y: 200 },
  { x: 'Wed', y: 150 },
  { x: 'Thu', y: 80 },
  { x: 'Fri', y: 170 }
]

const coloredData: BarChartDatum[] = [
  { x: 'Q1', y: 320, color: '#2563eb' },
  { x: 'Q2', y: 280, color: '#22c55e' },
  { x: 'Q3', y: 360, color: '#f97316' },
  { x: 'Q4', y: 420, color: '#a855f7' }
]

const currencyFormat = (value: number | string) => `$${value}`

const basicSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  x-axis-label="Weekday"
  y-axis-label="Sales"
/>`

const customSnippet = `<BarChart
  :data="coloredData"
  :width="420"
  :height="240"
  :barRadius="6"
  grid-line-style="dashed"
  :yTickFormat="(value) => \`$\${value}\`"
  :show-x-axis="false"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">BarChart 柱状图</h1>
      <p class="text-gray-600">用于展示分类数据的柱状图。</p>
    </div>

    <DemoBlock title="基础用法"
               description="自动生成坐标轴与网格。"
               :code="basicSnippet">
      <BarChart :data="basicData"
                :width="420"
                :height="240"
                x-axis-label="Weekday"
                y-axis-label="Sales" />
    </DemoBlock>

    <DemoBlock title="自定义样式"
               description="自定义颜色、圆角与刻度格式。"
               :code="customSnippet">
      <BarChart :data="coloredData"
                :width="420"
                :height="240"
                :barRadius="6"
                grid-line-style="dashed"
                :yTickFormat="currencyFormat"
                :show-x-axis="false" />
    </DemoBlock>
  </div>
</template>
