<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">HeatmapChart 热力图</h1>
    <p class="text-gray-500 mb-8">矩阵热力图，用颜色深浅展示数据密度。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、显示数值 & 自定义颜色，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">xLabels / yLabels 定义坐标轴</p>
          <HeatmapChart
            :data="heatData"
            :x-labels="days"
            :y-labels="hours"
            :width="500"
            :height="280"
            hoverable />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            显示数值 & 自定义颜色
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">showValues、minColor、maxColor</p>
          <HeatmapChart
            :data="heatData"
            :x-labels="days"
            :y-labels="hours"
            :width="500"
            :height="280"
            show-values
            min-color="#fef3c7"
            max-color="#dc2626"
            :cell-radius="4" />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { HeatmapChart } from '@expcat/tigercat-vue/HeatmapChart'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './HeatmapChartDemo.vue?raw'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['上午', '下午', '晚上']

const heatData = days.flatMap((day) =>
  hours.map((hour) => ({
    x: day,
    y: hour,
    value: Math.round(Math.random() * 100)
  }))
)
</script>
