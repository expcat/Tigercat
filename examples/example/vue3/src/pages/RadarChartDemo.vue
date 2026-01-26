<script setup lang="ts">
import { RadarChart, type RadarChartDatum, type RadarChartSeries } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

const basicSnippet = `<RadarChart
  :data="data"
  :width="360"
  :height="260"
/>`

const customSnippet = `<RadarChart
  :data="customData"
  :width="360"
  :height="260"
  :max-value="100"
  :levels="6"
    show-level-labels
  :fill-opacity="0.15"
  show-points
/>`

const multiSnippet = `<RadarChart
    :series="multiSeries"
    :width="360"
    :height="260"
    :max-value="100"
    :colors="['#2563eb', '#f97316']"
    hoverable
    selectable
    show-legend
    legend-position="right"
    :muted-opacity="0.2"
    :tooltip-formatter="tooltipFormatter"
/>`
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">RadarChart 雷达图</h1>
            <p class="text-gray-600">用于展示多维指标对比。</p>
        </div>

        <DemoBlock title="基础用法"
                   description="默认雷达图样式。"
                   :code="basicSnippet">
            <RadarChart :data="basicData"
                        :width="360"
                        :height="260" />
        </DemoBlock>

        <DemoBlock title="固定最大值"
                   description="统一尺度并增加网格层数。"
                   :code="customSnippet">
            <RadarChart :data="customData"
                        :width="360"
                        :height="260"
                        :max-value="100"
                        :levels="6"
                        show-level-labels
                        :fill-opacity="0.15"
                        show-points />
        </DemoBlock>

        <DemoBlock title="多系列对比"
                   description="多组数据叠加展示。"
                   :code="multiSnippet">
            <RadarChart :series="multiSeries"
                        :width="360"
                        :height="260"
                        :max-value="100"
                        :colors="['#2563eb', '#f97316']"
                        hoverable
                        selectable
                        show-legend
                        legend-position="right"
                        :muted-opacity="0.2"
                        :tooltip-formatter="tooltipFormatter" />
        </DemoBlock>
    </div>
</template>
