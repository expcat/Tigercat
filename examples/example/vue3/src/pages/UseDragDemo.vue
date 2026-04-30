<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDrag, Card, Tag } from '@expcat/tigercat-vue'
import type { DragItem } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

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

const reorderSnippet = `import { useDrag } from '@expcat/tigercat-vue'
import type { DragItem } from '@expcat/tigercat-core'

interface TodoItem extends DragItem {
  title: string
}

const items = ref<TodoItem[]>([
  { id: '1', index: 0, title: '编写需求文档' },
  { id: '2', index: 1, title: '完成接口联调' }
])

const drag = useDrag({
  onDrop: () => {
    const result = drag.reorder(items.value)
    if (result) {
      items.value = result.items.map((item, index) => ({ ...item, index }))
    }
  }
})

// 模板
<div v-bind="drag.getDropZoneAttrs()">
  <div v-for="item in items"
       :key="item.id"
       v-bind="drag.getDragItemAttrs(item)">
    {{ item.title }}
  </div>
</div>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">useDrag 拖拽</h1>
      <p class="text-gray-600">
        框架无关的拖拽逻辑封装，提供 <code>getDragItemAttrs</code> /
        <code>getDropZoneAttrs</code> 来快速绑定 HTML 拖拽事件。
      </p>
    </div>

    <DemoBlock title="基础列表排序"
               description="拖动条目即可重新排序，松开时通过 reorder() 计算新顺序。"
               :code="reorderSnippet">
      <div class="space-y-3"
           v-bind="drag.getDropZoneAttrs()">
        <Card v-for="item in items"
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
    </DemoBlock>
  </div>
</template>
