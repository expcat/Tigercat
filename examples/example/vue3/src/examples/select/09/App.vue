<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

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

const multiSearchValue = ref<(string | number)[]>([])

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
  <div class="min-w-0">
    <Space direction="vertical" class="w-full max-w-md">
      <Select
        v-model="multiSearchValue"
        :options="countries"
        multiple
        searchable
        placeholder="搜索并多选" />
      <p class="text-sm text-gray-600">
        选中：{{ multiSearchValue.length ? multiSearchValue.join(', ') : '未选择' }}
      </p>
    </Space>
  </div>
</template>
