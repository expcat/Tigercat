<script setup lang="ts">
import { ref } from 'vue'
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import { type LineChartDatum, type LineChartSeries } from '@expcat/tigercat-vue'

const basicData: LineChartDatum[] = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 },
  { x: 'May', y: 49 },
  { x: 'Jun', y: 60 }
]

const multiSeries: LineChartSeries[] = [
  {
    name: '销售额',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ]
  },
  {
    name: '利润',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 60 },
      { x: 'Q3', y: 45 },
      { x: 'Q4', y: 80 }
    ],
    strokeDasharray: '5,3'
  }
]

const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">单系列折线图，显示数据点。</p>
        <LineChart
          :data="basicData"
          :width="420"
          :height="240"
          show-points
          x-axis-label="Month"
          y-axis-label="Value" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多系列</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">多条折线对比，支持虚线样式。</p>
        <LineChart
          :series="multiSeries"
          :width="420"
          :height="240"
          hoverable
          show-legend
          show-points />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">曲线插值 + 面积填充</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          使用 monotone 平滑曲线并显示渐变面积。
        </p>
        <LineChart
          :data="basicData"
          :width="420"
          :height="240"
          curve="monotone"
          show-points
          show-area />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">面积渐变 + 空心圆点</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ECharts 风格：渐变填充区域、空心数据点、平滑曲线。
        </p>
        <LineChart
          :series="multiSeries"
          :width="420"
          :height="240"
          show-area
          :area-opacity="0.2"
          point-hollow
          show-points
          curve="monotone"
          show-legend />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">入场动画</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">线条从左到右绘制的入场动画效果。</p>
        <LineChart
          :data="basicData"
          :width="420"
          :height="240"
          animated
          show-area
          curve="monotone"
          show-points
          point-hollow />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">交互功能</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">悬停高亮、点击选择、图例联动。</p>
        <div class="space-y-4">
          <LineChart
            :series="multiSeries"
            :width="420"
            :height="240"
            hoverable
            selectable
            show-legend
            legend-position="right"
            show-points
            v-model:hoveredIndex="hoveredIndex" />
          <p class="text-sm text-gray-500">
            当前悬停: {{ hoveredIndex !== null ? multiSeries[hoveredIndex]?.name : '无' }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
