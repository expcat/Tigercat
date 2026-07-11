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
        <div class="text-sm text-gray-700 mb-2">小号（sm）</div>
        <RadioGroup v-model="sizeSmValue" size="sm" class="flex flex-wrap items-center gap-4">
          <Radio value="a">选项 A</Radio>
          <Radio value="b">选项 B</Radio>
          <Radio value="c">选项 C</Radio>
        </RadioGroup>
      </div>

      <div>
        <div class="text-sm text-gray-700 mb-2">默认（md）</div>
        <RadioGroup v-model="sizeMdValue" size="md" class="flex flex-wrap items-center gap-4">
          <Radio value="a">选项 A</Radio>
          <Radio value="b">选项 B</Radio>
          <Radio value="c">选项 C</Radio>
        </RadioGroup>
      </div>

      <div>
        <div class="text-sm text-gray-700 mb-2">大号（lg）</div>
        <RadioGroup v-model="sizeLgValue" size="lg" class="flex flex-wrap items-center gap-4">
          <Radio value="a">选项 A</Radio>
          <Radio value="b">选项 B</Radio>
          <Radio value="c">选项 C</Radio>
        </RadioGroup>
      </div>
    </Space>
  </div>
</template>
