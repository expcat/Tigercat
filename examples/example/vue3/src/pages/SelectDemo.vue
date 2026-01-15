<script setup lang="ts">
import { ref } from 'vue'
import { Select, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicValue = ref<string | number>('')
const defaultValue = ref<string | number>('china')
const disabledValue = ref<string | number>('china')

const sizeSmValue = ref<string | number>('option1')
const sizeMdValue = ref<string | number>('option2')
const sizeLgValue = ref<string | number>('option3')

const disabledOptionValue = ref<string | number>('')

const clearableValue = ref<string | number>('option2')
const notClearableValue = ref<string | number>('option2')

const searchableValue = ref<string | number>('')
const lastSearchQuery = ref('')

const multipleValue = ref<(string | number)[]>(['option1', 'option3'])

const groupedValue = ref<string | number>('apple')

const emptyValue = ref<string | number>('')

const options = [
  { label: '选项 1', value: 'option1' },
  { label: '选项 2', value: 'option2' },
  { label: '选项 3', value: 'option3' },
  { label: '选项 4', value: 'option4' }
]

const optionsWithDisabled = [
  { label: '可用选项', value: 'enabled' },
  { label: '禁用选项', value: 'disabled', disabled: true },
  { label: '另一个选项', value: 'another' }
]

const countries = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
  { label: '英国', value: 'uk' },
  { label: '法国', value: 'france' }
]

const groupedOptions = [
  {
    label: '水果',
    options: [
      { label: '苹果', value: 'apple' },
      { label: '香蕉', value: 'banana' },
      { label: '橙子', value: 'orange' }
    ]
  },
  {
    label: '蔬菜',
    options: [
      { label: '西红柿', value: 'tomato' },
      { label: '黄瓜', value: 'cucumber' },
      { label: '土豆', value: 'potato' }
    ]
  }
]

const basicSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="basicValue" :options="options" placeholder="请选择" />
  <p class="text-sm text-gray-600">选中的值：{{ basicValue || '未选择' }}</p>
</Space>`

const defaultSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="defaultValue" :options="countries" />
  <p class="text-sm text-gray-600">选中的国家：{{ defaultValue }}</p>
</Space>`

const disabledSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="disabledValue" :options="countries" disabled />
</Space>`

const sizeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="w-full">
    <p class="text-sm text-gray-600 mb-2">sm</p>
    <Select v-model="sizeSmValue" :options="options" size="sm" />
  </div>
  <div class="w-full">
    <p class="text-sm text-gray-600 mb-2">md</p>
    <Select v-model="sizeMdValue" :options="options" size="md" />
  </div>
  <div class="w-full">
    <p class="text-sm text-gray-600 mb-2">lg</p>
    <Select v-model="sizeLgValue" :options="options" size="lg" />
  </div>
</Space>`

const disabledOptionSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="disabledOptionValue" :options="optionsWithDisabled" placeholder="请选择" />
  <p class="text-sm text-gray-600">选中的值：{{ disabledOptionValue || '未选择' }}</p>
</Space>`

const clearableSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="w-full">
    <p class="text-sm text-gray-600 mb-2">clearable: true</p>
    <Select v-model="clearableValue" :options="options" />
  </div>
  <div class="w-full">
    <p class="text-sm text-gray-600 mb-2">clearable: false</p>
    <Select v-model="notClearableValue" :options="options" :clearable="false" />
  </div>
</Space>`

const searchableSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select
    v-model="searchableValue"
    :options="countries"
    searchable
    placeholder="搜索国家"
    @search="(q) => (lastSearchQuery = q)" />
  <p class="text-sm text-gray-600">最近一次搜索：{{ lastSearchQuery || '（无）' }}</p>
</Space>`

const multipleSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="multipleValue" :options="options" multiple placeholder="请选择多个" />
  <p class="text-sm text-gray-600">
    选中：{{ multipleValue.length ? multipleValue.join(', ') : '未选择' }}
  </p>
</Space>`

const groupedSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="groupedValue" :options="groupedOptions" />
  <p class="text-sm text-gray-600">选中的值：{{ groupedValue }}</p>
</Space>`

const emptySnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Select v-model="emptyValue" :options="[]" no-data-text="暂无数据" placeholder="无可用选项" />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Select 选择器</h1>
      <p class="text-gray-600">当选项过多时，使用下拉菜单展示并选择内容。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="适用广泛的基础选择器。"
               :code="basicSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="basicValue"
                :options="options"
                placeholder="请选择" />
        <p class="text-sm text-gray-600">选中的值：{{ basicValue || '未选择' }}</p>
      </Space>
    </DemoBlock>

    <!-- 有默认值 -->
    <DemoBlock title="有默认值"
               description="可以设置默认选中的值。"
               :code="defaultSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="defaultValue"
                :options="countries" />
        <p class="text-sm text-gray-600">选中的国家：{{ defaultValue }}</p>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态"
               description="禁用整个选择器组件。"
               :code="disabledSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="disabledValue"
                :options="countries"
                disabled />
      </Space>
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸"
               description="Select 支持 sm / md / lg 三种尺寸。"
               :code="sizeSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <div class="w-full">
          <p class="text-sm text-gray-600 mb-2">sm</p>
          <Select v-model="sizeSmValue"
                  :options="options"
                  size="sm" />
        </div>
        <div class="w-full">
          <p class="text-sm text-gray-600 mb-2">md</p>
          <Select v-model="sizeMdValue"
                  :options="options"
                  size="md" />
        </div>
        <div class="w-full">
          <p class="text-sm text-gray-600 mb-2">lg</p>
          <Select v-model="sizeLgValue"
                  :options="options"
                  size="lg" />
        </div>
      </Space>
    </DemoBlock>

    <!-- 禁用选项 -->
    <DemoBlock title="禁用选项"
               description="可以禁用单个选项。"
               :code="disabledOptionSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="disabledOptionValue"
                :options="optionsWithDisabled"
                placeholder="请选择" />
        <p class="text-sm text-gray-600">选中的值：{{ disabledOptionValue || '未选择' }}</p>
      </Space>
    </DemoBlock>

    <!-- 可清空 -->
    <DemoBlock title="可清空"
               description="默认支持清空，也可以关闭清空功能。"
               :code="clearableSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <div class="w-full">
          <p class="text-sm text-gray-600 mb-2">clearable: true</p>
          <Select v-model="clearableValue"
                  :options="options" />
        </div>
        <div class="w-full">
          <p class="text-sm text-gray-600 mb-2">clearable: false</p>
          <Select v-model="notClearableValue"
                  :options="options"
                  :clearable="false" />
        </div>
      </Space>
    </DemoBlock>

    <!-- 可搜索 -->
    <DemoBlock title="可搜索"
               description="启用 searchable 后可在下拉中输入关键字过滤选项。"
               :code="searchableSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="searchableValue"
                :options="countries"
                searchable
                placeholder="搜索国家"
                @search="(q) => (lastSearchQuery = q)" />
        <p class="text-sm text-gray-600">最近一次搜索：{{ lastSearchQuery || '（无）' }}</p>
      </Space>
    </DemoBlock>

    <!-- 多选 -->
    <DemoBlock title="多选"
               description="启用 multiple 后可选择多个选项。"
               :code="multipleSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="multipleValue"
                :options="options"
                multiple
                placeholder="请选择多个" />
        <p class="text-sm text-gray-600">
          选中：{{ multipleValue.length ? multipleValue.join(', ') : '未选择' }}
        </p>
      </Space>
    </DemoBlock>

    <!-- 分组选项 -->
    <DemoBlock title="分组选项"
               description="支持传入分组数据（group label + options）。"
               :code="groupedSnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="groupedValue"
                :options="groupedOptions" />
        <p class="text-sm text-gray-600">选中的值：{{ groupedValue }}</p>
      </Space>
    </DemoBlock>

    <!-- 空状态 -->
    <DemoBlock title="空状态"
               description="当 options 为空时，会显示空提示文案。"
               :code="emptySnippet">
      <Space direction="vertical"
             class="w-full max-w-md">
        <Select v-model="emptyValue"
                :options="[]"
                no-data-text="暂无数据"
                placeholder="无可用选项" />
      </Space>
    </DemoBlock>
  </div>
</template>
