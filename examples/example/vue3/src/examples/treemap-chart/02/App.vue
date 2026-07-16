<script setup lang="ts">
import { TreeMapChart } from '@expcat/tigercat-vue/TreeMapChart'

const data = [
  {
    label: '前端',
    value: 50,
    children: [
      { label: 'Vue', value: 30 },
      { label: 'React', value: 20 }
    ]
  },
  {
    label: '后端',
    value: 30,
    children: [
      { label: 'Node', value: 15 },
      { label: 'Go', value: 15 }
    ]
  },
  { label: '运维', value: 20 }
]
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="mb-1 text-sm text-gray-500">gradient + minLabelSize + 提示</p>
      <TreeMapChart
        :data="data"
        :width="500"
        :height="220"
        :gap="3"
        gradient
        :min-label-size="12"
        show-tooltip />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showLabels=false + 底部图例</p>
      <TreeMapChart
        :data="data"
        :width="500"
        :height="160"
        :show-labels="false"
        show-legend
        legend-position="bottom" />
    </div>
  </div>
</template>
