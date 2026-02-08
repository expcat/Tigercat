<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { DatePicker, Space, FormItem } from '@expcat/tigercat-vue'
import type { DemoLang } from '@demo-shared/app-config'
import DemoBlock from '../components/DemoBlock.vue'

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

const basicSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <DatePicker
    v-model="date"
    class="w-full max-w-[260px]"
    placeholder="请选择日期"
    :locale="locale" />
  <p class="text-sm text-gray-600">
    选中的日期：{{ date ? date.toLocaleDateString(locale) : '未选择' }}
  </p>
</Space>`

const rangeSnippet = `<Space direction="vertical" class="w-full max-w-md">
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
</Space>`

const labelsSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <DatePicker
    v-model="labeledRange"
    range
    class="w-full max-w-[340px]"
    :labels="customLabels"
    :locale="locale" />
</Space>`

const sizeSnippet = `<Space direction="vertical" class="w-full max-w-md">
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
</Space>`

const formatSnippet = `<Space direction="vertical" class="w-full max-w-md">
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
  <FormItem label="dd/MM/yyyy">
    <DatePicker
      v-model="dateWithDefault"
      class="w-full max-w-[260px]"
      format="dd/MM/yyyy"
      :locale="locale" />
  </FormItem>
  <FormItem label="yyyy/MM/dd">
    <DatePicker
      v-model="dateWithDefault"
      class="w-full max-w-[260px]"
      format="yyyy/MM/dd"
      :locale="locale" />
  </FormItem>
</Space>`

const minMaxSnippet = `<Space direction="vertical" class="w-full max-w-md">
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
</Space>`

const disabledSnippet = `<Space direction="vertical" class="w-full max-w-md">
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
</Space>`

const clearableSnippet = `<Space direction="vertical" class="w-full max-w-md">
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
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">DatePicker 日期选择器</h1>
      <p class="text-gray-600">用于选择或输入日期。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="基础的日期选择器组件。"
               :code="basicSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <DatePicker v-model="date"
                    class="w-full max-w-[260px]"
                    placeholder="请选择日期"
                    :locale="locale" />
        <p class="text-sm text-gray-600">
          选中的日期：{{ date ? date.toLocaleDateString(locale) : '未选择' }}
        </p>
      </Space>
    </DemoBlock>

    <!-- 范围选择 -->
    <DemoBlock title="范围选择"
               description="选择开始日期与结束日期。"
               :code="rangeSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <DatePicker v-model="range"
                    range
                    class="w-full max-w-[340px]"
                    placeholder="请选择日期范围"
                    :locale="locale" />
        <p class="text-sm text-gray-600">
          已选范围：{{ range[0] ? range[0].toLocaleDateString(locale) : '未选择' }} -
          {{ range[1] ? range[1].toLocaleDateString(locale) : '未选择' }}
        </p>
      </Space>
    </DemoBlock>

    <!-- 自定义文案 -->
    <DemoBlock title="自定义文案"
               description="通过 labels 覆盖 Today/OK 与 aria-label 文案。"
               :code="labelsSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <DatePicker v-model="labeledRange"
                    range
                    class="w-full max-w-[340px]"
                    :labels="customLabels"
                    :locale="locale" />
      </Space>
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸"
               description="日期选择器有三种尺寸：小、中、大。"
               :code="sizeSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <FormItem label="小尺寸">
          <DatePicker size="sm"
                      class="w-full max-w-[260px]"
                      placeholder="小尺寸日期选择器"
                      :locale="locale" />
        </FormItem>
        <FormItem label="中尺寸">
          <DatePicker size="md"
                      class="w-full max-w-[260px]"
                      placeholder="中尺寸日期选择器"
                      :locale="locale" />
        </FormItem>
        <FormItem label="大尺寸">
          <DatePicker size="lg"
                      class="w-full max-w-[260px]"
                      placeholder="大尺寸日期选择器"
                      :locale="locale" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 日期格式 -->
    <DemoBlock title="日期格式"
               description="支持四种日期显示格式。"
               :code="formatSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <FormItem label="yyyy-MM-dd">
          <DatePicker v-model="dateWithDefault"
                      class="w-full max-w-[260px]"
                      format="yyyy-MM-dd"
                      :locale="locale" />
        </FormItem>
        <FormItem label="MM/dd/yyyy">
          <DatePicker v-model="dateWithDefault"
                      class="w-full max-w-[260px]"
                      format="MM/dd/yyyy"
                      :locale="locale" />
        </FormItem>
        <FormItem label="dd/MM/yyyy">
          <DatePicker v-model="dateWithDefault"
                      class="w-full max-w-[260px]"
                      format="dd/MM/yyyy"
                      :locale="locale" />
        </FormItem>
        <FormItem label="yyyy/MM/dd">
          <DatePicker v-model="dateWithDefault"
                      class="w-full max-w-[260px]"
                      format="yyyy/MM/dd"
                      :locale="locale" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 日期范围限制 -->
    <DemoBlock title="日期范围限制"
               description="使用 min-date 和 max-date 限制可选择的日期范围（2024年度）。"
               :code="minMaxSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <DatePicker v-model="minMaxDate"
                    class="w-full max-w-[260px]"
                    :min-date="minDate"
                    :max-date="maxDate"
                    placeholder="仅可选择2024年的日期"
                    :locale="locale" />
        <p class="text-sm text-gray-600">
          选中日期：{{ minMaxDate ? minMaxDate.toLocaleDateString(locale) : '未选择' }}
        </p>
      </Space>
    </DemoBlock>

    <!-- 禁用和只读 -->
    <DemoBlock title="禁用和只读"
               description="日期选择器可以设置为禁用或只读状态。"
               :code="disabledSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <FormItem label="禁用">
          <DatePicker v-model="disabledDate"
                      class="w-full max-w-[260px]"
                      disabled
                      :locale="locale" />
        </FormItem>
        <FormItem label="只读">
          <DatePicker v-model="readonlyDate"
                      class="w-full max-w-[260px]"
                      readonly
                      :locale="locale" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 可清除 -->
    <DemoBlock title="可清除"
               description="使用 clearable 属性控制是否显示清除按钮。"
               :code="clearableSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <FormItem label="可清除">
          <DatePicker v-model="dateWithDefault"
                      class="w-full max-w-[260px]"
                      :clearable="true"
                      :locale="locale" />
        </FormItem>
        <FormItem label="不可清除">
          <DatePicker v-model="dateWithDefault"
                      class="w-full max-w-[260px]"
                      :clearable="false"
                      :locale="locale" />
        </FormItem>
      </Space>
    </DemoBlock>
  </div>
</template>
