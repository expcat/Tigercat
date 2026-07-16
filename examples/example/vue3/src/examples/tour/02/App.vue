<script setup lang="ts">
import { ref } from 'vue'
import type { TourStep } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { Tour } from '@expcat/tigercat-vue/Tour'

const open = ref(false)
const current = ref(0)
const includeOptional = ref(false)
const status = ref('尚未开始')

const loadSteps = async (): Promise<TourStep[]> => [
  {
    title: '异步加载完成',
    description: '这个居中步骤没有目标元素，并关闭了遮罩。',
    mask: false
  },
  {
    target: '#tour-optional-vue',
    title: '条件步骤',
    description: '只有启用可选步骤时才会显示。',
    placement: 'right',
    skipWhen: () => !includeOptional.value
  },
  {
    target: '#tour-finish-vue',
    title: '完成引导',
    description: '步骤支持分别设置目标位置和遮罩。',
    placement: 'top'
  }
]

const startTour = () => {
  current.value = 0
  status.value = '正在异步加载步骤'
  open.value = true
}

const handleChange = (nextCurrent: number) => {
  status.value = `当前原始步骤索引：${nextCurrent}`
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-3">
      <Button id="tour-optional-vue" @click="includeOptional = !includeOptional">
        可选步骤：{{ includeOptional ? '启用' : '跳过' }}
      </Button>
      <Button variant="primary" @click="startTour">启动异步引导</Button>
      <span id="tour-finish-vue" class="rounded bg-gray-100 px-3 py-2">最终目标</span>
    </div>
    <p role="status" class="text-sm text-gray-500">{{ status }}</p>
    <Tour
      v-model:open="open"
      v-model:current="current"
      :steps="[]"
      :load-steps="loadSteps"
      :closable="false"
      @change="handleChange"
      @finish="status = '引导已完成'" />
  </div>
</template>
