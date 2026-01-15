<script setup lang="ts">
import { ref } from 'vue'
import { Select, Space, Divider } from '@expcat/tigercat-vue'

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
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Select 选择器</h1>
      <p class="text-gray-600">当选项过多时，使用下拉菜单展示并选择内容。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">适用广泛的基础选择器。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="basicValue"
                  :options="options"
                  placeholder="请选择" />
          <p class="text-sm text-gray-600">选中的值：{{ basicValue || '未选择' }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 有默认值 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">有默认值</h2>
      <p class="text-gray-600 mb-6">可以设置默认选中的值。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="defaultValue"
                  :options="countries" />
          <p class="text-sm text-gray-600">选中的国家：{{ defaultValue }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">禁用整个选择器组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="disabledValue"
                  :options="countries"
                  disabled />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">Select 支持 sm / md / lg 三种尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用选项 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用选项</h2>
      <p class="text-gray-600 mb-6">可以禁用单个选项。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="disabledOptionValue"
                  :options="optionsWithDisabled"
                  placeholder="请选择" />
          <p class="text-sm text-gray-600">选中的值：{{ disabledOptionValue || '未选择' }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 可清空 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">可清空</h2>
      <p class="text-gray-600 mb-6">默认支持清空，也可以关闭清空功能。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 可搜索 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">可搜索</h2>
      <p class="text-gray-600 mb-6">启用 searchable 后可在下拉中输入关键字过滤选项。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="searchableValue"
                  :options="countries"
                  searchable
                  placeholder="搜索国家"
                  @search="(q) => (lastSearchQuery = q)" />
          <p class="text-sm text-gray-600">最近一次搜索：{{ lastSearchQuery || '（无）' }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 多选 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多选</h2>
      <p class="text-gray-600 mb-6">启用 multiple 后可选择多个选项。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 分组选项 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">分组选项</h2>
      <p class="text-gray-600 mb-6">支持传入分组数据（group label + options）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="groupedValue"
                  :options="groupedOptions" />
          <p class="text-sm text-gray-600">选中的值：{{ groupedValue }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 空状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">空状态</h2>
      <p class="text-gray-600 mb-6">当 options 为空时，会显示空提示文案。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <Select v-model="emptyValue"
                  :options="[]"
                  no-data-text="暂无数据"
                  placeholder="无可用选项" />
        </Space>
      </div>
    </section>
  </div>
</template>
