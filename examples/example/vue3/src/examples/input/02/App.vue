<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'

const value = ref<number | null>(12.5)
</script>

<template>
  <div class="w-full max-w-xs space-y-2">
    <InputNumber
      v-model="value"
      :min="0"
      :max="100"
      :step="0.5"
      :precision="1"
      size="lg"
      increment-aria-label="增加数值"
      decrement-aria-label="减少数值" />
    <p class="text-sm text-gray-600 dark:text-gray-300">当前数值：{{ value ?? '未填写' }}</p>
  </div>
</template>
