<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'

const value = ref<number | null>(1288.5)

const formatCurrency = (amount: number | undefined) =>
  amount === undefined
    ? ''
    : `¥ ${new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)}`

const parseCurrency = (displayValue: string) => {
  const parsed = Number.parseFloat(displayValue.replace(/[^\d.-]/g, ''))
  return Number.isNaN(parsed) ? null : parsed
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
      aria-label="预算" />
    <p class="text-sm text-gray-600 dark:text-gray-300">
      原始数值：{{ value ?? '未填写' }}。聚焦时框里是裸数字，失焦再套格式。
    </p>
  </div>
</template>
