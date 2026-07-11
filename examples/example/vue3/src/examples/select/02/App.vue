<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<string | number>('')
const cities = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' }
]
</script>

<template>
  <Select
    v-model="value"
    :options="cities"
    searchable
    placeholder="搜索城市"
    class="w-full max-w-sm" />
</template>
