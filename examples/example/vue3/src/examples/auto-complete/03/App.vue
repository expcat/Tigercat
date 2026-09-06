<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@expcat/tigercat-vue/AutoComplete'

const value = ref<string | number | undefined>()
const searchValue = ref('')
const options = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' }
]
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm text-[var(--tiger-text-muted)]">
      打字只改 searchValue；点选或回车才改 value。
    </p>
    <AutoComplete
      v-model="value"
      v-model:search-value="searchValue"
      :options="options"
      allow-free-input
      placeholder="输入或选择框架"
      class="w-full max-w-sm" />
    <p class="text-sm text-[var(--tiger-text-muted)]">
      query: {{ searchValue || '空' }} · value: {{ value ?? '未提交' }}
    </p>
  </div>
</template>
