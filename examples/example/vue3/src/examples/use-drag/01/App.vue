<script setup lang="ts">
import { Tag } from '@expcat/tigercat-vue/Tag'
import { ref, computed } from 'vue'
import { useDrag } from '@expcat/tigercat-vue'
import { reorderSequence, type DragItem } from '@expcat/tigercat-core'

interface TodoItem extends DragItem {
  title: string
}

const items = ref<TodoItem[]>([
  { id: '1', index: 0, title: '编写需求文档' },
  { id: '2', index: 1, title: '完成接口联调' },
  { id: '3', index: 2, title: '进行单元测试' },
  { id: '4', index: 3, title: '上线灰度发布' }
])

const drag = useDrag({
  containerId: 'todos',
  onDrop: (event) => {
    if (event.fromIndex === event.toIndex) return
    items.value = reorderSequence(items.value, event.fromIndex, event.toIndex).map(
      (item, index) => ({ ...item, index })
    )
  }
})

function moveBy(from: number, delta: number) {
  const to = from + delta
  if (to < 0 || to >= items.value.length) return
  items.value = reorderSequence(items.value, from, to).map((item, index) => ({
    ...item,
    index
  }))
}

const draggedTitle = computed(() => {
  const id = drag.draggedItem.value?.id
  return id ? (items.value.find((it) => it.id === id)?.title ?? '无') : '无'
})
</script>

<template>
  <div class="min-w-0">
    <ul class="m-0 list-none space-y-3 p-0" v-bind="drag.getDropZoneAttrs()">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        v-bind="drag.getDragItemAttrs(item)"
        class="flex cursor-grab items-center justify-between rounded-md border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#fff)] px-3 py-2 select-none">
        <span>{{ item.title }}</span>
        <span class="flex items-center gap-2">
          <Tag color="blue">序号 {{ item.index + 1 }}</Tag>
          <button
            type="button"
            class="text-xs text-[var(--tiger-text-muted,#6b7280)]"
            :disabled="index === 0"
            @click="moveBy(index, -1)">
            上移
          </button>
          <button
            type="button"
            class="text-xs text-[var(--tiger-text-muted,#6b7280)]"
            :disabled="index === items.length - 1"
            @click="moveBy(index, 1)">
            下移
          </button>
        </span>
      </li>
    </ul>
    <p class="mt-4 text-sm text-[var(--tiger-text-muted,#6b7280)]">
      指针拖拽重排（须包一层 drop zone）。键盘请用上移 / 下移。当前拖拽：
      <strong>{{ draggedTitle }}</strong>
    </p>
  </div>
</template>
