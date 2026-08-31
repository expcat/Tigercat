<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<string | number | undefined>('standard')
const options = [
  { label: '标准版', value: 'standard' },
  { label: '专业版', value: 'pro' },
  { label: '企业版（暂不可用）', value: 'enterprise', disabled: true }
]
</script>

<template>
  <FormItem label="套餐" class="w-full max-w-sm">
    <Select v-model="value" :options="options" clearable size="lg" />
  </FormItem>
</template>
