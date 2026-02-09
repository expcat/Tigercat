<script setup lang="ts">
import { ref } from 'vue'
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

const interactiveData: BarChartDatum[] = [
  { x: 'Jan', y: 180 },
  { x: 'Feb', y: 220 },
  { x: 'Mar', y: 190 },
  { x: 'Apr', y: 280 },
  { x: 'May', y: 250 },
  { x: 'Jun', y: 310 }
]

const smallValuesData: BarChartDatum[] = [
  { x: 'A', y: 500 },
  { x: 'B', y: 420 },
  { x: 'C', y: 2 },
  { x: 'D', y: 380 },
  { x: 'E', y: 0.5 }
]

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const clickedBar = ref<string>('')

const handleBarClick = (_index: number, datum: BarChartDatum) => {
  clickedBar.value = `点击了 ${datum.x}，值为 ${datum.y}`
}

const currencyFormat = (value: number | string) => `$${value}`

const basicSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  x-axis-label="Weekday"
  y-axis-label="Sales"
/>`

const gradientSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  gradient
  animated
  :barRadius="6"
  grid-line-style="dashed"
  show-value-labels
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

const hoverableSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  gradient
  v-model:hoveredIndex="hoveredIndex"
/>`

const selectableSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  selectable
  gradient
  v-model:selectedIndex="selectedIndex"
  @bar-click="handleBarClick"
/>`

const legendSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  show-legend
  legend-position="right"
/>`

const tooltipSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  hoverable
  show-tooltip
  gradient
/>`

const valueLabelSnippet = `<BarChart
  :data="data"
  :width="420"
  :height="240"
  show-value-labels
  value-label-position="top"
  gradient
  :barRadius="6"
/>`

const constraintSnippet = `<BarChart
  :data="smallValuesData"
  :width="420"
  :height="240"
  :barMinHeight="3"
  :barMaxWidth="40"
  gradient
  show-value-labels
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">BarChart 柱状图</h1>
      <p class="text-gray-600">
        用于展示分类数据的柱状图，支持渐变填充、数值标签、入场动画等 ECharts 风格特性。
      </p>
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

    <DemoBlock title="渐变填充 + 动画"
               description="启用 gradient 渐变与 animated 平滑过渡，配合数值标签。"
               :code="gradientSnippet">
      <BarChart :data="interactiveData"
                :width="420"
                :height="240"
                gradient
                animated
                :barRadius="6"
                grid-line-style="dashed"
                show-value-labels />
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

    <DemoBlock title="数值标签"
               description="show-value-labels 在柱子上方或内部显示数值。"
               :code="valueLabelSnippet">
      <BarChart :data="basicData"
                :width="420"
                :height="240"
                show-value-labels
                value-label-position="top"
                gradient
                :barRadius="6" />
    </DemoBlock>

    <DemoBlock title="柱宽/柱高约束"
               description="barMaxWidth 限制最大柱宽，barMinHeight 保证微小值可见。"
               :code="constraintSnippet">
      <BarChart :data="smallValuesData"
                :width="420"
                :height="240"
                :barMinHeight="3"
                :barMaxWidth="40"
                gradient
                show-value-labels />
    </DemoBlock>

    <DemoBlock title="悬停高亮"
               description="启用 hoverable 后，鼠标悬停时高亮柱子，其余淡出。"
               :code="hoverableSnippet">
      <div class="space-y-4">
        <BarChart :data="interactiveData"
                  :width="420"
                  :height="240"
                  hoverable
                  gradient
                  v-model:hoveredIndex="hoveredIndex" />
        <p class="text-sm text-gray-500">
          当前悬停: {{ hoveredIndex !== null ? interactiveData[hoveredIndex]?.x : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="点击选中"
               description="启用 selectable 后，点击可选中柱子，支持事件回调。"
               :code="selectableSnippet">
      <div class="space-y-4">
        <BarChart :data="interactiveData"
                  :width="420"
                  :height="240"
                  hoverable
                  selectable
                  gradient
                  v-model:selectedIndex="selectedIndex"
                  @bar-click="handleBarClick" />
        <p class="text-sm text-gray-500">
          选中: {{ selectedIndex !== null ? interactiveData[selectedIndex]?.x : '无' }}
          <span v-if="clickedBar"
                class="ml-4">{{ clickedBar }}</span>
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="显示图例"
               description="通过 show-legend 显示图例，可设置位置。"
               :code="legendSnippet">
      <BarChart :data="coloredData"
                :width="420"
                :height="240"
                hoverable
                show-legend
                legend-position="right" />
    </DemoBlock>

    <DemoBlock title="显示提示框"
               description="通过 show-tooltip 在悬停时显示数据提示。"
               :code="tooltipSnippet">
      <BarChart :data="interactiveData"
                :width="420"
                :height="240"
                hoverable
                show-tooltip
                gradient />
    </DemoBlock>
  </div>
</template>
