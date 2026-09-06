<script setup lang="ts">
import { ref } from 'vue'
import { Drag } from '@expcat/tigercat-vue/Drag'
import type { DragItem } from '@expcat/tigercat-core'

interface Todo extends DragItem {
  title: string
}

const items = ref<Todo[]>([
  { id: '1', index: 0, title: '编写需求' },
  { id: '2', index: 1, title: '接口联调' },
  { id: '3', index: 2, title: '发布' }
])
</script>

<template>
  <Drag v-model:items="items" container-id="todos">
    <template #item="{ item, attrs }">
      <li
        v-bind="attrs"
        class="mb-2 cursor-grab rounded-md border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2">
        {{ item.title }}
      </li>
    </template>
  </Drag>
</template>
