<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<string | number>('standard')
const options = [
  { label: '标准版', value: 'standard' },
  { label: '专业版', value: 'pro' },
  { label: '企业版（暂不可用）', value: 'enterprise', disabled: true }
]
</script>

<template>
  <Select v-model="value" :options="options" clearable size="lg" class="w-full max-w-sm" />
</template>
