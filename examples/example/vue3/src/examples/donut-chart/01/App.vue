<script setup lang="ts">
import { ref, computed } from 'vue'
import { DonutChart } from '@expcat/tigercat-vue/DonutChart'
import { type PieChartDatum } from '@expcat/tigercat-vue'

const basicData: PieChartDatum[] = [
  { value: 40, label: '直接访问' },
  { value: 25, label: '邮件营销' },
  { value: 20, label: '联盟广告' },
  { value: 15, label: '搜索引擎' }
]

const interactiveData: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' },
  { value: 548, label: '搜索引擎' }
]

const total = computed(() => interactiveData.reduce((s, d) => s + d.value, 0))

const hoveredIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const selectedSummary = computed(() => {
  if (selectedIndex.value === null) return '无'
  const datum = interactiveData[selectedIndex.value]
  if (!datum) return '无'
  return `${datum.label} · ${datum.value} · ${((datum.value / total.value) * 100).toFixed(1)}%`
})
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          开箱即用的环形图，默认带阴影和间隙，中心可显示汇总数据。
        </p>
        <DonutChart
          :data="basicData"
          :width="360"
          :height="260"
          :show-labels="true"
          center-value="100"
          center-label="总计" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">悬停高亮</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          启用 hoverable，悬停时扇区外移并放大，配合中心显示实时数据。
        </p>
        <div class="space-y-4">
          <DonutChart
            :data="interactiveData"
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">点击选中</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          启用 selectable，点击可选中扇区并保持高亮。
        </p>
        <div class="space-y-4">
          <DonutChart
            :data="interactiveData"
            :width="360"
            :height="260"
            hoverable
            selectable
            :show-labels="true"
            v-model:selectedIndex="selectedIndex" />
          <p class="text-sm text-gray-500">选中: {{ selectedSummary }}</p>
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">显示图例</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          右侧图例 + 中心汇总数据，鼠标与图例联动高亮。
        </p>
        <DonutChart
          :data="interactiveData"
          :width="360"
          :height="260"
          hoverable
          show-legend
          legend-position="right"
          :center-value="total"
          center-label="访问量" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">显示提示框</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          悬停时显示数据提示框，自动计算百分比。
        </p>
        <DonutChart
          :data="interactiveData"
          :width="360"
          :height="260"
          hoverable
          show-tooltip
          :center-value="total"
          center-label="总计" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义样式</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          自定义配色、更大的间隙和悬停偏移、不同的内径比。
        </p>
        <DonutChart
          :data="interactiveData"
          :width="360"
          :height="260"
          hoverable
          :colors="['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae']"
          :inner-radius-ratio="0.5"
          :pad-angle="0.06"
          :hover-offset="14"
          center-value="1562"
          center-label="总量" />
      </section>
    </div>
  </div>
</template>
