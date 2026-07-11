<script setup lang="ts">
import { RadarChart } from '@expcat/tigercat-vue/RadarChart'
import { type RadarChartDatum, type RadarChartSeries } from '@expcat/tigercat-vue'

const basicData: RadarChartDatum[] = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]

const customData: RadarChartDatum[] = [
  { label: '攻击', value: 95 },
  { label: '防御', value: 70 },
  { label: '机动', value: 88 },
  { label: '耐久', value: 60 },
  { label: '辅助', value: 75 }
]

const multiSeries: RadarChartSeries[] = [
  {
    name: '产品 A',
    data: [
      { label: '速度', value: 80 },
      { label: '稳定', value: 65 },
      { label: '设计', value: 90 },
      { label: '续航', value: 70 },
      { label: '价格', value: 50 }
    ]
  },
  {
    name: '产品 B',
    data: [
      { label: '速度', value: 72 },
      { label: '稳定', value: 78 },
      { label: '设计', value: 82 },
      { label: '续航', value: 66 },
      { label: '价格', value: 60 }
    ]
  }
]

const tooltipFormatter = (
  datum: RadarChartDatum,
  _seriesIndex: number,
  _index: number,
  series?: RadarChartSeries
) => `${series?.name ?? 'Series'} · ${datum.label ?? ''}: ${datum.value}`
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">默认雷达图样式。</p>
        <RadarChart :data="basicData" :width="360" :height="260" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">固定最大值</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">统一尺度并增加网格层数。</p>
        <RadarChart
          :data="customData"
          :width="360"
          :height="260"
          :max-value="100"
          :levels="6"
          show-level-labels
          :fill-opacity="0.15"
          show-points />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">圆形网格 + 分割区域</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">ECharts 风格的圆形网格与交替背景。</p>
        <RadarChart
          :data="customData"
          :width="360"
          :height="260"
          :max-value="100"
          grid-shape="circle"
          show-split-area
          :levels="5"
          show-level-labels
          :fill-opacity="0.25"
          :stroke-width="2"
          :point-border-width="2"
          point-border-color="#fff" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多系列对比</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          多组数据叠加展示，支持交互与分割区域。
        </p>
        <RadarChart
          :series="multiSeries"
          :width="360"
          :height="260"
          :max-value="100"
          :colors="['#2563eb', '#f97316']"
          hoverable
          selectable
          show-legend
          legend-position="right"
          show-split-area
          :fill-opacity="0.15"
          :tooltip-formatter="tooltipFormatter" />
      </section>
    </div>
  </div>
</template>
