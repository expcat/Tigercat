<script setup lang="ts">
import { ref } from 'vue'
import { LineChart, type LineChartDatum, type LineChartSeries } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

const basicSnippet = `<LineChart
  :data="data"
  :width="420"
  :height="240"
  show-points
  x-axis-label="Month"
  y-axis-label="Value"
/>`

const multiSeriesSnippet = `<LineChart
  :series="multiSeries"
  :width="420"
  :height="240"
  hoverable
  show-legend
  show-points
/>`

const curveSnippet = `<LineChart
  :data="data"
  :width="420"
  :height="240"
  curve="monotone"
  show-points
/>`

const interactiveSnippet = `<LineChart
  :series="multiSeries"
  :width="420"
  :height="240"
  hoverable
  selectable
  show-legend
  legend-position="right"
  show-points
  v-model:hoveredIndex="hoveredIndex"
  @series-click="handleSeriesClick"
/>`
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">LineChart 折线图</h1>
            <p class="text-gray-600">用于展示数据随时间或类别变化趋势。</p>
        </div>

        <DemoBlock title="基础用法"
                   description="单系列折线图，显示数据点。"
                   :code="basicSnippet">
            <LineChart :data="basicData"
                       :width="420"
                       :height="240"
                       show-points
                       x-axis-label="Month"
                       y-axis-label="Value" />
        </DemoBlock>

        <DemoBlock title="多系列"
                   description="多条折线对比，支持虚线样式。"
                   :code="multiSeriesSnippet">
            <LineChart :series="multiSeries"
                       :width="420"
                       :height="240"
                       hoverable
                       show-legend
                       show-points />
        </DemoBlock>

        <DemoBlock title="曲线插值"
                   description="使用 monotone 平滑曲线。"
                   :code="curveSnippet">
            <LineChart :data="basicData"
                       :width="420"
                       :height="240"
                       curve="monotone"
                       show-points />
        </DemoBlock>

        <DemoBlock title="交互功能"
                   description="悬停高亮、点击选择、图例联动。"
                   :code="interactiveSnippet">
            <div class="space-y-4">
                <LineChart :series="multiSeries"
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
        </DemoBlock>
    </div>
</template>
