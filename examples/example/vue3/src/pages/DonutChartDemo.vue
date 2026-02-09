<script setup lang="ts">
import { ref, computed } from 'vue'
import { DonutChart, type DonutChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicData: DonutChartDatum[] = [
  { value: 40, label: '直接访问' },
  { value: 25, label: '邮件营销' },
  { value: 20, label: '联盟广告' },
  { value: 15, label: '搜索引擎' }
]

const interactiveData: DonutChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' },
  { value: 548, label: '搜索引擎' }
]

const total = computed(() => interactiveData.reduce((s, d) => s + d.value, 0))

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)

const basicSnippet = `<DonutChart
  :data="data"
  :width="360"
  :height="260"
  :show-labels="true"
  center-value="100"
  center-label="总计"
/>`

const hoverableSnippet = `<DonutChart
  :data="data"
  :width="360"
  :height="260"
  hoverable
  :center-value="total"
  center-label="访问量"
  v-model:hoveredIndex="hoveredIndex"
/>`

const selectableSnippet = `<DonutChart
  :data="data"
  :width="360"
  :height="260"
  hoverable
  selectable
  :show-labels="true"
  v-model:selectedIndex="selectedIndex"
/>`

const legendSnippet = `<DonutChart
  :data="data"
  :width="360"
  :height="260"
  hoverable
  show-legend
  legend-position="right"
  :center-value="total"
  center-label="访问量"
/>`

const tooltipSnippet = `<DonutChart
  :data="data"
  :width="360"
  :height="260"
  hoverable
  show-tooltip
  :center-value="total"
  center-label="总计"
/>`

const customSnippet = `<DonutChart
  :data="data"
  :width="360"
  :height="260"
  hoverable
  :colors="['#c23531','#2f4554','#61a0a8','#d48265','#91c7ae']"
  :inner-radius-ratio="0.5"
  :pad-angle="0.06"
  :hover-offset="14"
  center-value="1562"
  center-label="总量"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">DonutChart 环形图</h1>
      <p class="text-gray-600">ECharts 风格的环形图，支持中心内容、阴影、交互高亮等高级特性。</p>
    </div>

    <DemoBlock title="基础用法"
               description="开箱即用的环形图，默认带阴影和间隙，中心可显示汇总数据。"
               :code="basicSnippet">
      <DonutChart :data="basicData"
                  :width="360"
                  :height="260"
                  :show-labels="true"
                  center-value="100"
                  center-label="总计" />
    </DemoBlock>

    <DemoBlock title="悬停高亮"
               description="启用 hoverable，悬停时扇区外移并放大，配合中心显示实时数据。"
               :code="hoverableSnippet">
      <div class="space-y-4">
        <DonutChart :data="interactiveData"
                    :width="360"
                    :height="260"
                    hoverable
                    :center-value="hoveredIndex !== null ? interactiveData[hoveredIndex]?.value : total"
                    :center-label="hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '访问量'"
                    v-model:hoveredIndex="hoveredIndex" />
        <p class="text-sm text-gray-500">
          当前悬停: {{ hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="点击选中"
               description="启用 selectable，点击可选中扇区并保持高亮。"
               :code="selectableSnippet">
      <div class="space-y-4">
        <DonutChart :data="interactiveData"
                    :width="360"
                    :height="260"
                    hoverable
                    selectable
                    :show-labels="true"
                    v-model:selectedIndex="selectedIndex" />
        <p class="text-sm text-gray-500">
          选中: {{ selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="显示图例"
               description="右侧图例 + 中心汇总数据，鼠标与图例联动高亮。"
               :code="legendSnippet">
      <DonutChart :data="interactiveData"
                  :width="360"
                  :height="260"
                  hoverable
                  show-legend
                  legend-position="right"
                  :center-value="total"
                  center-label="访问量" />
    </DemoBlock>

    <DemoBlock title="显示提示框"
               description="悬停时显示数据提示框，自动计算百分比。"
               :code="tooltipSnippet">
      <DonutChart :data="interactiveData"
                  :width="360"
                  :height="260"
                  hoverable
                  show-tooltip
                  :center-value="total"
                  center-label="总计" />
    </DemoBlock>

    <DemoBlock title="自定义样式"
               description="自定义配色、更大的间隙和悬停偏移、不同的内径比。"
               :code="customSnippet">
      <DonutChart :data="interactiveData"
                  :width="360"
                  :height="260"
                  hoverable
                  :colors="['#c23531','#2f4554','#61a0a8','#d48265','#91c7ae']"
                  :inner-radius-ratio="0.5"
                  :pad-angle="0.06"
                  :hover-offset="14"
                  center-value="1562"
                  center-label="总量" />
    </DemoBlock>
  </div>
</template>
