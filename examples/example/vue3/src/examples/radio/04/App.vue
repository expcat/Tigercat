<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'

const value = ref<string | number>('monthly')
const options = [
  { label: '按月', value: 'monthly' },
  { label: '按年', value: 'yearly' },
  { label: '一次性', value: 'once', disabled: true }
]
</script>

<template>
  <RadioGroup v-model="value" :options="options" aria-label="订阅周期" />
</template>
