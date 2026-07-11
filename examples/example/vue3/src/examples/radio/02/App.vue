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
      <Radio value="agree" v-model="agreed">同意用户协议</Radio>
      <Radio value="standalone" :default-value="true">默认选中的独立选项</Radio>
    </Space>
  </div>
</template>
