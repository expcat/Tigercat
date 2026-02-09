<script setup lang="ts">
import { ref } from 'vue'
import { AreaChart, type AreaChartDatum, type AreaChartSeries } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: AreaChartDatum[] = [
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

const basicSnippet = `<AreaChart
  :data="data"
  :width="420"
  :height="240"
  :fill-opacity="0.3"
  x-axis-label="Month"
  y-axis-label="Value"
/>`

const multiSeriesSnippet = `<AreaChart
  :series="multiSeries"
  :width="420"
  :height="240"
  hoverable
  show-legend
/>`

const stackedSnippet = `<AreaChart
  :series="stackedSeries"
  :width="420"
  :height="240"
  stacked
  hoverable
  show-legend
  legend-position="right"
/>`

const interactiveSnippet = `<AreaChart
  :series="multiSeries"
  :width="420"
  :height="240"
  hoverable
  selectable
  show-points
  show-legend
  curve="monotone"
  v-model:hoveredIndex="hoveredIndex"
/>`

const gradientSnippet = `<AreaChart
  :data="data"
  :width="420"
  :height="240"
  gradient
  curve="monotone"
  show-points
  point-hollow
  animated
/>`
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">AreaChart 面积图</h1>
            <p class="text-gray-600">用于展示数据随时间变化的趋势，强调数量累积。</p>
        </div>

        <DemoBlock title="基础用法"
                   description="单系列面积图。"
                   :code="basicSnippet">
            <AreaChart :data="basicData"
                       :width="420"
                       :height="240"
                       :fill-opacity="0.3"
                       x-axis-label="Month"
                       y-axis-label="Value" />
        </DemoBlock>

        <DemoBlock title="渐变填充 + 动画"
                   description="渐变面积填充、曲线平滑、空心数据点与入场动画，对齐 ECharts 视觉效果。"
                   :code="gradientSnippet">
            <AreaChart :data="basicData"
                       :width="420"
                       :height="240"
                       gradient
                       curve="monotone"
                       show-points
                       point-hollow
                       animated />
        </DemoBlock>

        <DemoBlock title="多系列"
                   description="多个系列对比。"
                   :code="multiSeriesSnippet">
            <AreaChart :series="multiSeries"
                       :width="420"
                       :height="240"
                       hoverable
                       show-legend />
        </DemoBlock>

        <DemoBlock title="堆叠面积图"
                   description="数据堆叠展示，适合展示部分与整体关系。"
                   :code="stackedSnippet">
            <AreaChart :series="stackedSeries"
                       :width="420"
                       :height="240"
                       stacked
                       hoverable
                       show-legend
                       legend-position="right" />
        </DemoBlock>

        <DemoBlock title="交互功能"
                   description="悬停高亮、点击选择、曲线平滑。"
                   :code="interactiveSnippet">
            <div class="space-y-4">
                <AreaChart :series="multiSeries"
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
        </DemoBlock>
    </div>
</template>
