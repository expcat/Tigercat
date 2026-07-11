<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<string | number>('apple')
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
</script>

<template>
  <Select v-model="value" :options="groupedOptions" class="w-full max-w-sm" />
</template>
