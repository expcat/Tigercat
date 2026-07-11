<script setup lang="ts">
import { FunnelChart } from '@expcat/tigercat-vue/FunnelChart'

const funnelData = [
  { label: '访问', value: 5000 },
  { label: '咨询', value: 3200 },
  { label: '意向', value: 1800 },
  { label: '成交', value: 800 },
  { label: '复购', value: 300 }
]
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">垂直漏斗，hoverable 启用悬停</p>
        <FunnelChart :data="funnelData" :width="400" :height="280" hoverable show-legend />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">水平方向 & 收尖</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          direction='horizontal'，pinch 收尖末端
        </p>
        <FunnelChart
          :data="funnelData"
          :width="500"
          :height="200"
          direction="horizontal"
          pinch
          hoverable />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义颜色 & 间距</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">colors 调色板，gap 段间距</p>
        <FunnelChart
          :data="funnelData"
          :width="400"
          :height="280"
          :colors="['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']"
          :gap="4"
          hoverable
          selectable />
      </section>
    </div>
  </div>
</template>
