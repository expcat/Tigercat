<script setup lang="ts">
import { ref } from 'vue'
import { ActivityFeed } from '@expcat/tigercat-vue/ActivityFeed'
import type { ActivityGroup, ActivityItem } from '@expcat/tigercat-core'

type FeedView = 'flat' | 'grouped' | 'loading' | 'empty'

const activities: ActivityItem[] = [
  {
    id: 1,
    title: 'R34 示例已开始',
    description: 'ActivityFeed 正在补齐平铺、分组和状态展示。',
    time: '10:20',
    user: { name: 'Lin' },
    status: { label: '进行中', variant: 'warning' }
  },
  {
    id: 2,
    title: 'Example 门禁已排队',
    description: '完成实现后将运行源码、编译和构建检查。',
    time: '09:45',
    user: { name: 'Mia' },
    status: { label: '待验证', variant: 'info' }
  },
  {
    id: 3,
    title: 'R33 已归档',
    description: '高优先级组件的高级展示已经完成。',
    time: '昨天',
    user: { name: 'Kai' },
    status: { label: '完成', variant: 'success' }
  }
]

const groups: ActivityGroup[] = [
  { key: 'today', title: '今天', items: activities.slice(0, 2) },
  { key: 'yesterday', title: '昨天', items: activities.slice(2) }
]

const view = ref<FeedView>('flat')
const viewOptions: Array<{ value: FeedView; label: string }> = [
  { value: 'flat', label: '平铺动态' },
  { value: 'grouped', label: '分组动态' },
  { value: 'loading', label: '加载状态' },
  { value: 'empty', label: '空状态' }
]
</script>

<template>
  <div class="max-w-xl space-y-4">
    <div class="flex flex-wrap gap-2" role="group" aria-label="动态列表展示状态">
      <button
        v-for="option in viewOptions"
        :key="option.value"
        type="button"
        class="rounded px-3 py-1.5 text-sm"
        :class="
          view === option.value
            ? 'bg-blue-600 text-white'
            : 'border border-gray-300 dark:border-gray-600'
        "
        :aria-pressed="view === option.value"
        @click="view = option.value">
        {{ option.label }}
      </button>
    </div>

    <ActivityFeed
      :items="view === 'flat' ? activities : []"
      :groups="view === 'grouped' ? groups : undefined"
      :loading="view === 'loading'"
      loading-text="正在加载团队动态..."
      empty-text="当前没有动态" />
  </div>
</template>
