<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, Space, Divider, FormItem } from '@tigercat/vue'

const date = ref<Date | null>(null)
const dateWithDefault = ref(new Date('2024-01-15'))
const minMaxDate = ref<Date | null>(null)
const disabledDate = ref(new Date('2024-06-15'))
const readonlyDate = ref(new Date('2024-06-15'))
const range = ref<[Date | null, Date | null]>([null, null])
const locale = ref<'zh-CN' | 'en-US'>('zh-CN')

const minDate = new Date('2024-01-01')
const maxDate = new Date('2024-12-31')
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
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">语言</label>
            <select v-model="locale"
                    class="border border-gray-300 rounded px-3 py-2">
              <option value="zh-CN">中文（简体）</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>

          <DatePicker v-model="date"
                      placeholder="请选择日期"
                      :locale="locale" />
          <p class="text-sm text-gray-600">选中的日期：{{ date ? date.toLocaleDateString(locale) : '未选择' }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 范围选择 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">范围选择</h2>
      <p class="text-gray-600 mb-6">选择开始日期与结束日期。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <DatePicker v-model="range"
                      range
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

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">日期选择器有三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <FormItem label="小尺寸">
            <DatePicker size="sm"
                        placeholder="小尺寸日期选择器" />
          </FormItem>
          <FormItem label="中尺寸">
            <DatePicker size="md"
                        placeholder="中尺寸日期选择器" />
          </FormItem>
          <FormItem label="大尺寸">
            <DatePicker size="lg"
                        placeholder="大尺寸日期选择器" />
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
        <Space direction="vertical"
               class="w-full max-w-md">
          <FormItem label="yyyy-MM-dd">
            <DatePicker v-model="dateWithDefault"
                        format="yyyy-MM-dd"
                        :locale="locale" />
          </FormItem>
          <FormItem label="MM/dd/yyyy">
            <DatePicker v-model="dateWithDefault"
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
        <Space direction="vertical"
               class="w-full max-w-md">
          <DatePicker v-model="minMaxDate"
                      :min-date="minDate"
                      :max-date="maxDate"
                      placeholder="仅可选择2024年的日期"
                      :locale="locale" />
          <p class="text-sm text-gray-600">选中日期：{{ minMaxDate ? minMaxDate.toLocaleDateString(locale) : '未选择' }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用和只读 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用和只读</h2>
      <p class="text-gray-600 mb-6">日期选择器可以设置为禁用或只读状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <FormItem label="禁用">
            <DatePicker v-model="disabledDate"
                        disabled />
          </FormItem>
          <FormItem label="只读">
            <DatePicker v-model="readonlyDate"
                        readonly />
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
        <Space direction="vertical"
               class="w-full max-w-md">
          <FormItem label="可清除">
            <DatePicker v-model="dateWithDefault"
                        :clearable="true" />
          </FormItem>
          <FormItem label="不可清除">
            <DatePicker v-model="dateWithDefault"
                        :clearable="false" />
          </FormItem>
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/"
                   class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
