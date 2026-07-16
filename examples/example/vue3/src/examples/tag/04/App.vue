<script setup lang="ts">
import { ref } from 'vue'
import { Tag } from '@expcat/tigercat-vue/Tag'

const sizes = ['sm', 'md', 'lg'] as const
const items = ref(['前端', '后端', '设计', '测试'])
const remove = (t: string) => {
  items.value = items.value.filter((x) => x !== t)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <Tag v-for="size in sizes" :key="size" variant="primary" :size="size">尺寸 {{ size }}</Tag>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Tag v-for="t in items" :key="t" variant="info" closable @close="remove(t)">{{ t }}</Tag>
      <span v-if="items.length === 0" class="text-sm text-gray-500">已全部移除</span>
    </div>
  </div>
</template>
