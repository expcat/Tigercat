<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { TimePicker } from '@expcat/tigercat-vue/TimePicker'
import type { DemoLang } from '@demo-shared/app-config'

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const locale = demoLang
const time = ref<string | null>(null)
const time24 = ref<string | null>('14:30')
const time12 = ref<string | null>('14:30')
const timeWithSeconds = ref<string | null>('14:30:45')
const timeWithSteps = ref<string | null>(null)
const timeWithRange = ref<string | null>(null)
const timeRange = ref<[string | null, string | null]>([null, null])
</script>

<template>
  <div class="min-w-0">
    <div class="max-w-md space-y-4">
      <TimePicker
        v-model="timeRange"
        class="w-full max-w-[340px]"
        :locale="locale"
        :range="true"
        :placeholder="locale === 'zh-CN' ? '请选择时间段' : 'Select time range'" />
      <p class="text-sm text-gray-600">
        选中的时间段：{{ timeRange[0] || '未选择' }} - {{ timeRange[1] || '未选择' }}
      </p>
    </div>
  </div>
</template>
