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
    <div class="max-w-md space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">小尺寸</label>
        <TimePicker
          size="sm"
          class="w-full max-w-[260px]"
          :locale="locale"
          placeholder="小尺寸时间选择器" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
        <TimePicker
          size="md"
          class="w-full max-w-[260px]"
          :locale="locale"
          placeholder="中尺寸时间选择器" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
        <TimePicker
          size="lg"
          class="w-full max-w-[260px]"
          :locale="locale"
          placeholder="大尺寸时间选择器" />
      </div>
    </div>
  </div>
</template>
