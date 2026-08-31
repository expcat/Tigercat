<script setup lang="ts">
import { ref } from 'vue'
import { Tag } from '@expcat/tigercat-vue/Tag'

const items = ref(['前端', '后端', '设计'])
const remove = (t: string) => {
  items.value = items.value.filter((x) => x !== t)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Tag v-for="item in items" :key="item" variant="primary" closable @close="remove(item)">
      {{ item }}
    </Tag>
    <span v-if="items.length === 0" class="text-sm text-gray-500">已全部移除</span>
  </div>
</template>
