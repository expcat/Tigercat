<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { DatePicker, Space, Divider, FormItem } from '@expcat/tigercat-vue'
import type { DemoLang } from '@demo-shared/app-config'

const date = ref<Date | null>(null)
const dateWithDefault = ref(new Date('2024-01-15'))
const minMaxDate = ref<Date | null>(null)
const disabledDate = ref(new Date('2024-06-15'))
const readonlyDate = ref(new Date('2024-06-15'))
const range = ref<[Date | null, Date | null]>([null, null])
const labeledRange = ref<[Date | null, Date | null]>([new Date('2024-03-10'), null])

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const locale = computed(() => demoLang.value)

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
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">DatePicker 日期选择器</h1>
      <p class="text-gray-600">用于选择或输入日期。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的日期选择器组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <DatePicker
            v-model="date"
            class="w-full max-w-[260px]"
            placeholder="请选择日期"
            :locale="locale" />
          <p class="text-sm text-gray-600">
            选中的日期：{{ date ? date.toLocaleDateString(locale) : '未选择' }}
          </p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 范围选择 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">范围选择</h2>
      <p class="text-gray-600 mb-6">选择开始日期与结束日期。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <DatePicker
            v-model="range"
            range
            class="w-full max-w-[340px]"
            placeholder="请选择日期范围"
            :locale="locale" />
          <p class="text-sm text-gray-600">
            已选范围：{{ range[0] ? range[0].toLocaleDateString(locale) : '未选择' }} -
            {{ range[1] ? range[1].toLocaleDateString(locale) : '未选择' }}
          </p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义文案 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义文案</h2>
      <p class="text-gray-600 mb-6">通过 labels 覆盖 Today/OK 与 aria-label 文案。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <DatePicker
            v-model="labeledRange"
            range
            class="w-full max-w-[340px]"
            :labels="customLabels"
            :locale="locale" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">日期选择器有三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="小尺寸">
            <DatePicker
              size="sm"
              class="w-full max-w-[260px]"
              placeholder="小尺寸日期选择器"
              :locale="locale" />
          </FormItem>
          <FormItem label="中尺寸">
            <DatePicker
              size="md"
              class="w-full max-w-[260px]"
              placeholder="中尺寸日期选择器"
              :locale="locale" />
          </FormItem>
          <FormItem label="大尺寸">
            <DatePicker
              size="lg"
              class="w-full max-w-[260px]"
              placeholder="大尺寸日期选择器"
              :locale="locale" />
          </FormItem>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 日期格式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">日期格式</h2>
      <p class="text-gray-600 mb-6">仅展示两种常用日期显示格式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="yyyy-MM-dd">
            <DatePicker
              v-model="dateWithDefault"
              class="w-full max-w-[260px]"
              format="yyyy-MM-dd"
              :locale="locale" />
          </FormItem>
          <FormItem label="MM/dd/yyyy">
            <DatePicker
              v-model="dateWithDefault"
              class="w-full max-w-[260px]"
              format="MM/dd/yyyy"
              :locale="locale" />
          </FormItem>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 日期范围限制 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">日期范围限制</h2>
      <p class="text-gray-600 mb-6">使用 min-date 和 max-date 限制可选择的日期范围（2024年度）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      <Divider class="my-6" />
    </section>

    <!-- 禁用和只读 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用和只读</h2>
      <p class="text-gray-600 mb-6">日期选择器可以设置为禁用或只读状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="禁用">
            <DatePicker
              v-model="disabledDate"
              class="w-full max-w-[260px]"
              disabled
              :locale="locale" />
          </FormItem>
          <FormItem label="只读">
            <DatePicker
              v-model="readonlyDate"
              class="w-full max-w-[260px]"
              readonly
              :locale="locale" />
          </FormItem>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 可清除 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">可清除</h2>
      <p class="text-gray-600 mb-6">使用 clearable 属性控制是否显示清除按钮。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="可清除">
            <DatePicker
              v-model="dateWithDefault"
              class="w-full max-w-[260px]"
              :clearable="true"
              :locale="locale" />
          </FormItem>
          <FormItem label="不可清除">
            <DatePicker
              v-model="dateWithDefault"
              class="w-full max-w-[260px]"
              :clearable="false"
              :locale="locale" />
          </FormItem>
        </Space>
      </div>
    </section>
  </div>
</template>
