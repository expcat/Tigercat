<script setup lang="ts">
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Radio } from '@expcat/tigercat-vue/Radio'

const basicValue = ref<string | number>('male')
const agreed = ref(false)
const uncontrolledValue = ref<string | number>('male')
const disabledValue = ref<string | number>('medium')
const groupDisabledValue = ref<string | number>('a')

const sizeSmValue = ref<string | number>('a')
const sizeMdValue = ref<string | number>('a')
const sizeLgValue = ref<string | number>('a')

const numericValue = ref<string | number>(1)
const customValue = ref<string | number>('a')

const handleUncontrolledChange = (value: string | number) => {
  uncontrolledValue.value = value
}
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical">
      <div>
        <div class="text-sm text-gray-700 mb-2">部分禁用</div>
        <RadioGroup v-model="disabledValue" class="flex flex-wrap items-center gap-4">
          <Radio value="small">小</Radio>
          <Radio value="medium">中</Radio>
          <Radio value="large" disabled>大（禁用）</Radio>
        </RadioGroup>
      </div>

      <div>
        <div class="text-sm text-gray-700 mb-2">整组禁用</div>
        <RadioGroup v-model="groupDisabledValue" disabled class="flex flex-wrap items-center gap-4">
          <Radio value="a">选项 A</Radio>
          <Radio value="b">选项 B</Radio>
          <Radio value="c">选项 C</Radio>
        </RadioGroup>
      </div>
    </Space>
  </div>
</template>
