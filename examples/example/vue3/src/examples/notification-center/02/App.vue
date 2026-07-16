<script setup lang="ts">
import { ref } from 'vue'
import { NotificationCenter } from '@expcat/tigercat-vue/NotificationCenter'
import type { NotificationItem, NotificationReadFilter } from '@expcat/tigercat-core'

type ViewState = 'content' | 'loading' | 'empty'

const items = ref<NotificationItem[]>([
  {
    id: 1,
    title: '发布检查已通过',
    description: 'v2.0.4 的本地发布门禁全部通过。',
    time: '11:20',
    type: '产品',
    read: false
  },
  {
    id: 2,
    title: '示例审查已完成',
    description: 'R32 的三个高级组件已经补齐展示。',
    time: '10:05',
    type: '产品',
    read: true
  },
  {
    id: 3,
    title: '维护窗口提醒',
    description: '今晚 23:00 将进行例行维护。',
    time: '昨天',
    type: '系统',
    read: false
  }
])

const activeGroupKey = ref<string | number>('产品')
const readFilter = ref<NotificationReadFilter>('all')
const view = ref<ViewState>('content')
const viewOptions: Array<{ value: ViewState; label: string }> = [
  { value: 'content', label: '通知列表' },
  { value: 'loading', label: '加载状态' },
  { value: 'empty', label: '空状态' }
]

const groupBy = (item: NotificationItem) => String(item.type ?? '其他')

const handleItemReadChange = (item: NotificationItem, read: boolean) => {
  items.value = items.value.map((candidate) =>
    candidate.id === item.id ? { ...candidate, read } : candidate
  )
}

const handleMarkAllRead = (
  _groupKey: string | number | undefined,
  groupItems: NotificationItem[]
) => {
  const ids = new Set(groupItems.map((item) => item.id))
  items.value = items.value.map((item) => (ids.has(item.id) ? { ...item, read: true } : item))
}
</script>

<template>
  <div class="max-w-xl space-y-4">
    <div class="flex flex-wrap gap-2" role="group" aria-label="通知中心展示状态">
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

    <p class="text-sm text-gray-500">当前分组：{{ activeGroupKey }}；筛选：{{ readFilter }}</p>

    <NotificationCenter
      v-model:active-group-key="activeGroupKey"
      v-model:read-filter="readFilter"
      :items="view === 'empty' ? [] : items"
      :group-by="groupBy"
      :group-order="['产品', '系统']"
      :loading="view === 'loading'"
      loading-text="正在同步通知..."
      empty-text="当前没有通知"
      @item-read-change="handleItemReadChange"
      @mark-all-read="handleMarkAllRead" />
  </div>
</template>
