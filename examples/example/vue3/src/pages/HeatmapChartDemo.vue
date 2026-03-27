<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">HeatmapChart 热力图</h1>
    <p class="text-gray-500 mb-8">矩阵热力图，用颜色深浅展示数据密度。</p>

    <DemoBlock title="基础用法" description="xLabels / yLabels 定义坐标轴" :code="basicSnippet">
      <HeatmapChart :data="heatData" :x-labels="days" :y-labels="hours" :width="500" :height="280" hoverable />
    </DemoBlock>

    <DemoBlock title="显示数值 & 自定义颜色" description="showValues、minColor、maxColor" :code="customSnippet">
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
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { HeatmapChart } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['上午', '下午', '晚上']

const heatData = days.flatMap((_, xi) =>
  hours.map((_, yi) => ({
    x: xi,
    y: yi,
    value: Math.round(Math.random() * 100)
  }))
)

const basicSnippet = `const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['上午', '下午', '晚上']
const data = days.flatMap((_, xi) =>
  hours.map((_, yi) => ({ x: xi, y: yi, value: Math.round(Math.random() * 100) }))
)

<HeatmapChart :data="data" :x-labels="days" :y-labels="hours" :width="500" :height="280" hoverable />`

const customSnippet = `<HeatmapChart
  :data="data" :x-labels="days" :y-labels="hours"
  :width="500" :height="280" show-values
  min-color="#fef3c7" max-color="#dc2626" :cell-radius="4" />`
</script>
