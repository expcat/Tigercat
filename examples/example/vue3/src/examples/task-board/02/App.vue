<script setup lang="ts">
import { ref } from 'vue'
import { TaskBoard } from '@expcat/tigercat-vue/TaskBoard'
import type {
  TaskBoardCard,
  TaskBoardColumn,
  TaskBoardColumnMoveEvent
} from '@expcat/tigercat-core'

const columns = ref<TaskBoardColumn[]>([
  {
    id: 'backlog',
    title: '待规划',
    cards: [
      {
        id: 1,
        title: '补齐筛选示例',
        description: '展示标题与描述搜索',
        priority: '高',
        owner: 'Lin'
      },
      {
        id: 2,
        title: '整理主题文档',
        description: '核对暗色模式说明',
        priority: '中',
        owner: 'Mia'
      }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    cards: [
      {
        id: 3,
        title: '运行发布门禁',
        description: '验证示例构建和分组测试',
        priority: '高',
        owner: 'Kai'
      }
    ]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [
      {
        id: 4,
        title: '发布 v2.0.4',
        description: '包与 tag 已同步',
        priority: '低',
        owner: 'Yun'
      }
    ]
  }
])

const filterText = ref('')
const moveStatus = ref('拖动列标题可调整顺序')

const handleColumnMove = (event: TaskBoardColumnMoveEvent) => {
  moveStatus.value = `列 ${String(event.columnId)}：${event.fromIndex + 1} → ${event.toIndex + 1}`
}

const cardPriority = (card: TaskBoardCard) => String(card.priority ?? '普通')
const cardOwner = (card: TaskBoardCard) => String(card.owner ?? '未分配')
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-3">
      <label class="flex items-center gap-2 text-sm">
        过滤卡片
        <input
          v-model="filterText"
          class="rounded border border-gray-300 bg-transparent px-3 py-1.5 dark:border-gray-600"
          placeholder="例如：发布" />
      </label>
      <span class="text-sm text-gray-500" aria-live="polite">{{ moveStatus }}</span>
    </div>

    <TaskBoard
      v-model:columns="columns"
      :filter-text="filterText"
      column-draggable
      show-card-count
      @column-move="handleColumnMove">
      <template #card="{ card }">
        <div class="space-y-2">
          <div class="font-medium">{{ card.title }}</div>
          <p class="text-xs text-gray-500">{{ card.description }}</p>
          <div class="flex items-center justify-between text-xs">
            <span
              class="rounded bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
              {{ cardPriority(card) }}优先级
            </span>
            <span class="text-gray-500">{{ cardOwner(card) }}</span>
          </div>
        </div>
      </template>
    </TaskBoard>
  </div>
</template>
