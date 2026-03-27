<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Calendar 日历</h1>
    <p class="text-gray-500 mb-8">按月/年展示日期的日历面板，支持日期选择和禁用。</p>

    <DemoBlock title="基础用法" description="默认月视图，v-model 绑定选中日期" :code="basicSnippet">
      <Calendar v-model="selectedDate" />
      <p class="mt-2 text-sm text-gray-500">选中日期: {{ selectedDate?.toLocaleDateString() ?? '无' }}</p>
    </DemoBlock>

    <DemoBlock title="年视图 & 全屏" description="mode='year' 显示月份选择，fullscreen 全屏模式" :code="yearSnippet">
      <Calendar mode="year" fullscreen />
    </DemoBlock>

    <DemoBlock title="禁用日期" description="disabledDate 函数禁用周末" :code="disabledSnippet">
      <Calendar v-model="selectedDate2" :disabled-date="isWeekend" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const selectedDate = ref<Date | undefined>(new Date())
const selectedDate2 = ref<Date | undefined>(new Date())

const isWeekend = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const basicSnippet = `<Calendar v-model="selectedDate" />

<script setup>
const selectedDate = ref(new Date())
<\/script>`

const yearSnippet = `<Calendar mode="year" fullscreen />`

const disabledSnippet = `<Calendar v-model="date" :disabled-date="isWeekend" />

<script setup>
const isWeekend = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}
<\/script>`
</script>
