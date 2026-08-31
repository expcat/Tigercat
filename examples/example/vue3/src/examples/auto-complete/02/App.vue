<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@expcat/tigercat-vue/AutoComplete'

const value = ref<string | number | undefined>()
const options = [
  { label: '北京 Beijing', value: 'beijing' },
  { label: '上海 Shanghai', value: 'shanghai' },
  { label: '深圳 Shenzhen', value: 'shenzhen' }
]
</script>

<template>
  <AutoComplete
    v-model="value"
    :options="options"
    placeholder="输入城市中英文名称"
    class="w-full max-w-sm" />
</template>
