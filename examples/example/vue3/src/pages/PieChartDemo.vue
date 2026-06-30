<script setup lang="ts">
import { ref } from 'vue'
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import { type PieChartDatum } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './PieChartDemo.vue?raw'

const salesData: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' },
  { value: 148, label: '搜索引擎' }
]

const colorfulData: PieChartDatum[] = [
  { value: 40, label: '产品 A', color: '#5470c6' },
  { value: 28, label: '产品 B', color: '#91cc75' },
  { value: 22, label: '产品 C', color: '#fac858' },
  { value: 15, label: '产品 D', color: '#ee6666' },
  { value: 12, label: '产品 E', color: '#73c0de' }
]

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const clickedSlice = ref<string>('')

const handleSliceClick = (datum: PieChartDatum, _index: number) => {
  clickedSlice.value = `点击了 ${datum.label}，值 ${datum.value}`
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">PieChart 饼图</h1>
      <p class="text-gray-600 dark:text-gray-400">
        ECharts 风格饼图：悬停偏移、边框分隔、外部标签引导线、阴影等特效。
      </p>
    </div>

    <DemoBlock
      title="组合展示"
      description="合并展示基础饼图、悬停偏移 + 阴影、外部标签 + 引导线、点击选中 + 图例、完整效果，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础饼图</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            自带 2px 白色边框分隔扇区，视觉更清晰。
          </p>
          <PieChart :data="salesData" :width="380" :height="280" :show-labels="true" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">悬停偏移 + 阴影</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            hoverable + shadow 模拟 ECharts emphasis 效果：悬停时扇区向外偏移并附带阴影。
          </p>
          <div class="space-y-4">
            <PieChart
              :data="colorfulData"
              :width="380"
              :height="280"
              hoverable
              shadow
              v-model:hoveredIndex="hoveredIndex" />
            <p class="text-sm text-gray-500">
              当前悬停: {{ hoveredIndex !== null ? colorfulData[hoveredIndex]?.label : '无' }}
            </p>
          </div>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">外部标签 + 引导线</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            labelPosition='outside' 时标签在扇区外侧，带引导线显示名称与百分比。
          </p>
          <PieChart
            :data="salesData"
            :width="440"
            :height="320"
            :show-labels="true"
            label-position="outside"
            hoverable
            shadow />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">点击选中 + 图例</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            selectable 支持点击选中；配合图例实现完整交互。
          </p>
          <div class="space-y-4">
            <PieChart
              :data="colorfulData"
              :width="380"
              :height="280"
              hoverable
              selectable
              shadow
              show-legend
              legend-position="right"
              v-model:selectedIndex="selectedIndex"
              @slice-click="handleSliceClick" />
            <p class="text-sm text-gray-500">
              选中: {{ selectedIndex !== null ? colorfulData[selectedIndex]?.label : '无' }}
              <span v-if="clickedSlice" class="ml-4">{{ clickedSlice }}</span>
            </p>
          </div>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">完整效果</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            悬停偏移 + 阴影 + 外部标签 + 图例 + 提示框的完整示例。
          </p>
          <PieChart
            :data="salesData"
            :width="480"
            :height="340"
            hoverable
            shadow
            :show-labels="true"
            label-position="outside"
            show-legend
            legend-position="right"
            show-tooltip />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>
