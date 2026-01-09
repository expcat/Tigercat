<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@tigercat/vue'

const locale = ref<'zh-CN' | 'en-US'>('zh-CN')
const time = ref<string | null>(null)
const time24 = ref<string | null>('14:30')
const time12 = ref<string | null>('14:30')
const timeWithSeconds = ref<string | null>('14:30:45')
const timeWithSteps = ref<string | null>(null)
const timeWithRange = ref<string | null>(null)
const timeRange = ref<[string | null, string | null]>([null, null])
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">TimePicker 时间选择器</h1>
      <p class="text-gray-600">用于选择或输入时间。</p>

      <div class="mt-4 flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700">语言</label>
        <select class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                v-model="locale">
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的时间选择器组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-4">
          <TimePicker v-model="time"
                      :locale="locale"
                      placeholder="请选择时间" />
          <p class="text-sm text-gray-600">
            选中的时间：{{ time || '未选择' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 时间段选择 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">时间段选择</h2>
      <p class="text-gray-600 mb-6">启用 range 后可选择开始/结束时间。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-4">
          <TimePicker v-model="timeRange"
                      :locale="locale"
                      :range="true"
                      :placeholder="locale === 'zh-CN' ? '请选择时间段' : 'Select time range'" />
          <p class="text-sm text-gray-600">
            选中的时间段：{{ timeRange[0] || '未选择' }} - {{ timeRange[1] || '未选择' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">时间选择器有三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">小尺寸</label>
            <TimePicker size="sm"
                        :locale="locale"
                        placeholder="小尺寸时间选择器" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
            <TimePicker size="md"
                        :locale="locale"
                        placeholder="中尺寸时间选择器" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
            <TimePicker size="lg"
                        :locale="locale"
                        placeholder="大尺寸时间选择器" />
          </div>
        </div>
      </div>
    </section>

    <!-- 时间格式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">时间格式</h2>
      <p class="text-gray-600 mb-6">支持 12 小时制和 24 小时制。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">24 小时制</label>
            <TimePicker v-model="time24"
                        :locale="locale"
                        format="24" />
            <p class="text-sm text-gray-500 mt-1">显示：{{ time24 }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">12 小时制</label>
            <TimePicker v-model="time12"
                        :locale="locale"
                        format="12" />
            <p class="text-sm text-gray-500 mt-1">显示：{{ time12 }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 显示秒 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">显示秒</h2>
      <p class="text-gray-600 mb-6">使用 showSeconds 属性控制是否显示秒。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-4">
          <TimePicker v-model="timeWithSeconds"
                      :locale="locale"
                      :show-seconds="true"
                      placeholder="选择时间（包含秒）" />
          <p class="text-sm text-gray-600">
            选中时间：{{ timeWithSeconds || '未选择' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 时间步长 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">时间步长</h2>
      <p class="text-gray-600 mb-6">使用 hourStep、minuteStep、secondStep 控制时间选择步长。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-4">
          <TimePicker v-model="timeWithSteps"
                      :hour-step="2"
                      :minute-step="15"
                      :locale="locale"
                      placeholder="小时步长 2，分钟步长 15" />
          <p class="text-sm text-gray-600">
            选中时间：{{ timeWithSteps || '未选择' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 时间范围限制 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">时间范围限制</h2>
      <p class="text-gray-600 mb-6">使用 minTime 和 maxTime 限制可选择的时间范围（9:00-18:00）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-4">
          <TimePicker v-model="timeWithRange"
                      min-time="09:00"
                      max-time="18:00"
                      :locale="locale"
                      placeholder="仅可选择 9:00-18:00" />
          <p class="text-sm text-gray-600">
            选中时间：{{ timeWithRange || '未选择' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 禁用和只读 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用和只读</h2>
      <p class="text-gray-600 mb-6">时间选择器可以设置为禁用或只读状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">禁用</label>
            <TimePicker model-value="14:30"
                        :locale="locale"
                        disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">只读</label>
            <TimePicker model-value="14:30"
                        :locale="locale"
                        readonly />
          </div>
        </div>
      </div>
    </section>

    <!-- 可清除 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">可清除</h2>
      <p class="text-gray-600 mb-6">使用 clearable 属性控制是否显示清除按钮。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">可清除</label>
            <TimePicker v-model="time24"
                        :locale="locale"
                        :clearable="true" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
            <TimePicker v-model="time24"
                        :locale="locale"
                        :clearable="false" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
