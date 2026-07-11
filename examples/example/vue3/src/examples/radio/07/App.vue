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
    <RadioGroup v-model="customValue" class="flex flex-wrap items-center gap-6" name="custom-radio">
      <Radio value="a" class-name="bg-blue-50 px-3 py-1 rounded">选项 A</Radio>
      <Radio value="b" class-name="bg-green-50 px-3 py-1 rounded">选项 B</Radio>
    </RadioGroup>
  </div>
</template>
