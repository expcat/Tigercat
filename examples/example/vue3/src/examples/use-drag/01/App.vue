<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
import { Tag } from '@expcat/tigercat-vue/Tag'
import { ref, computed } from 'vue'
import { useDrag } from '@expcat/tigercat-vue'
import type { DragItem } from '@expcat/tigercat-core'

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
  onDrop: () => {
    const result = drag.reorder(items.value)
    if (result) {
      items.value = result.items.map((item, index) => ({ ...item, index }))
    }
  }
})

const draggedTitle = computed(() => {
  const id = drag.draggedItem.value?.id
  return id ? (items.value.find((it) => it.id === id)?.title ?? '无') : '无'
})
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-3" v-bind="drag.getDropZoneAttrs()">
      <Card
        v-for="item in items"
        :key="item.id"
        v-bind="drag.getDragItemAttrs(item)"
        class="cursor-move select-none">
        <div class="flex items-center justify-between">
          <span>{{ item.title }}</span>
          <Tag color="blue">序号 {{ item.index + 1 }}</Tag>
        </div>
      </Card>
    </div>
    <div class="mt-4 text-sm text-gray-500">
      当前拖拽：<strong>{{ draggedTitle }}</strong>
    </div>
  </div>
</template>
