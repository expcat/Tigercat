<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { MaskInput } from '@expcat/tigercat-vue/MaskInput'
import type { MaskInputChangeDetail } from '@expcat/tigercat-core'

const date = ref('')
const dateMasked = ref('')
const phone = ref('')

const onDateChange = (_raw: string, detail: MaskInputChangeDetail) => {
  dateMasked.value = detail.maskedValue
}
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <FormItem label="日期">
      <MaskInput v-model="date" mask="##/##/####" placeholder="MM/DD/YYYY" @change="onDateChange" />
    </FormItem>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      原始值：{{ date || '暂无' }}；格式化：{{ dateMasked || '暂无' }}
    </p>
    <FormItem label="电话">
      <MaskInput v-model="phone" mask="(###) ###-####" placeholder="(555) 123-4567" type="tel" />
    </FormItem>
    <p class="text-sm text-gray-600 dark:text-gray-300">电话原始值：{{ phone || '暂无' }}</p>
  </div>
</template>
