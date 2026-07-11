<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { ref, computed, inject, type Ref } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'
import type { DemoLang } from '@demo-shared/app-config'

const date = ref<Date | null>(null)
const dateWithDefault = ref(new Date('2024-01-15'))
const minMaxDate = ref<Date | null>(null)
const disabledDate = ref(new Date('2024-06-15'))
const readonlyDate = ref(new Date('2024-06-15'))
const range = ref<[Date | null, Date | null]>([null, null])
const labeledRange = ref<[Date | null, Date | null]>([new Date('2024-03-10'), null])

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const locale = demoLang

const minDate = new Date('2024-01-01')
const maxDate = new Date('2024-12-31')

const customLabels = computed(() => {
  const isZh = locale.value === 'zh-CN'
  return {
    today: isZh ? '今天（自定义）' : 'Today (Custom)',
    ok: isZh ? '确定（自定义）' : 'OK (Custom)',
    toggleCalendar: isZh ? '打开选择器' : 'Open picker'
  }
})
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full max-w-md">
      <DatePicker
        v-model="minMaxDate"
        class="w-full max-w-[260px]"
        :min-date="minDate"
        :max-date="maxDate"
        placeholder="仅可选择2024年的日期"
        :locale="locale" />
      <p class="text-sm text-gray-600">
        选中日期：{{ minMaxDate ? minMaxDate.toLocaleDateString(locale) : '未选择' }}
      </p>
    </Space>
  </div>
</template>
