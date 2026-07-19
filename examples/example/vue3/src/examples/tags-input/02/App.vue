<script setup lang="ts">
import { ref } from 'vue'
import { TagsInput } from '@expcat/tigercat-vue/TagsInput'

const tags = ref<string[]>(['alpha'])
const toLower = (tag: string) => tag.toLowerCase()
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <TagsInput
      v-model="tags"
      :delimiters="[',', ';']"
      :before-add="toLower"
      placeholder="逗号/分号或回车分隔，自动小写"
    />
    <p class="text-sm text-gray-600 dark:text-gray-300">当前：{{ tags.join(' · ') || '暂无' }}</p>
  </div>
</template>
