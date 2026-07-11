<script setup lang="ts">
import { ref } from 'vue'
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import { type LineChartDatum, type AreaChartSeries } from '@expcat/tigercat-vue'

const basicData: LineChartDatum[] = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 },
  { x: 'May', y: 49 },
  { x: 'Jun', y: 60 }
]

const multiSeries: AreaChartSeries[] = [
  {
    name: '产品 A',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ],
    fillOpacity: 0.4
  },
  {
    name: '产品 B',
    data: [
      { x: 'Q1', y: 80 },
      { x: 'Q2', y: 100 },
      { x: 'Q3', y: 90 },
      { x: 'Q4', y: 130 }
    ],
    fillOpacity: 0.4
  }
]

const stackedSeries: AreaChartSeries[] = [
  {
    name: '移动端',
    data: [
      { x: 'Jan', y: 40 },
      { x: 'Feb', y: 55 },
      { x: 'Mar', y: 60 },
      { x: 'Apr', y: 70 }
    ]
  },
  {
    name: '桌面端',
    data: [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 35 },
      { x: 'Mar', y: 40 },
      { x: 'Apr', y: 45 }
    ]
  },
  {
    name: '平板端',
    data: [
      { x: 'Jan', y: 20 },
      { x: 'Feb', y: 25 },
      { x: 'Mar', y: 22 },
      { x: 'Apr', y: 28 }
    ]
  }
]

const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">单系列面积图。</p>
        <AreaChart
          :data="basicData"
          :width="420"
          :height="240"
          :fill-opacity="0.3"
          x-axis-label="Month"
          y-axis-label="Value" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">渐变填充 + 动画</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          渐变面积填充、曲线平滑、空心数据点与入场动画，对齐 ECharts 视觉效果。
        </p>
        <AreaChart
          :data="basicData"
          :width="420"
          :height="240"
          gradient
          curve="monotone"
          show-points
          point-hollow
          animated />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多系列</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">多个系列对比。</p>
        <AreaChart :series="multiSeries" :width="420" :height="240" hoverable show-legend />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">堆叠面积图</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          数据堆叠展示，适合展示部分与整体关系。
        </p>
        <AreaChart
          :series="stackedSeries"
          :width="420"
          :height="240"
          stacked
          hoverable
          show-legend
          legend-position="right" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">交互功能</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">悬停高亮、点击选择、曲线平滑。</p>
        <div class="space-y-4">
          <AreaChart
            :series="multiSeries"
            :width="420"
            :height="240"
            hoverable
            selectable
            show-points
            show-legend
            curve="monotone"
            v-model:hoveredIndex="hoveredIndex" />
          <p class="text-sm text-gray-500">
            当前悬停: {{ hoveredIndex !== null ? multiSeries[hoveredIndex]?.name : '无' }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
