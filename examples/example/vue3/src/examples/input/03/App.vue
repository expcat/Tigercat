<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'

const value = ref<number | null>(1288.5)

const formatCurrency = (nextValue: number | undefined) =>
  nextValue === undefined
    ? ''
    : `¥ ${new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(nextValue)}`

const parseCurrency = (displayValue: string) => {
  const parsed = Number.parseFloat(displayValue.replace(/[^\d.-]/g, ''))
  return Number.isNaN(parsed) ? 0 : parsed
}
</script>

<template>
  <div class="w-full max-w-sm space-y-3">
    <InputNumber
      v-model="value"
      :min="0"
      :max="10000"
      :step="100"
      :precision="2"
      :formatter="formatCurrency"
      :parser="parseCurrency"
      controls-position="both"
      increment-aria-label="增加预算"
      decrement-aria-label="减少预算" />
    <p class="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
      原始数值：{{ value ?? '未填写' }}；减号与加号分列输入框两侧。
    </p>
  </div>
</template>
