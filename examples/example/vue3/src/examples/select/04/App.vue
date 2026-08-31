<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<string | number | undefined>(undefined)
const loading = ref(false)
const groupedOptions = [
  {
    label: '水果',
    options: [
      { label: '苹果', value: 'apple' },
      { label: '香蕉', value: 'banana' }
    ]
  },
  {
    label: '蔬菜',
    options: [
      { label: '番茄', value: 'tomato' },
      { label: '黄瓜', value: 'cucumber' }
    ]
  }
]

function onSearch() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 240)
}
</script>

<template>
  <Select
    v-model="value"
    :options="groupedOptions"
    searchable
    creatable
    remote
    :loading="loading"
    class="w-full max-w-sm"
    @update:search-value="onSearch" />
</template>
