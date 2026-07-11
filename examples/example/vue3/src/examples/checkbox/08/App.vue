<script setup lang="ts">
import { CheckboxGroup } from '@expcat/tigercat-vue/CheckboxGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref, computed } from 'vue'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'

const checked = ref(false)
const fruitsIndeterminate = ref<string[]>(['apple'])
const fruits = ref<string[]>(['apple'])
const groupSizeValues = ref<string[]>(['apple'])

const options = ['apple', 'banana', 'orange']

const allChecked = computed(() => fruitsIndeterminate.value.length === options.length)
const indeterminate = computed(
  () => fruitsIndeterminate.value.length > 0 && fruitsIndeterminate.value.length < options.length
)

const handleCheckAllChange = (value: boolean) => {
  fruitsIndeterminate.value = value ? [...options] : []
}
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical">
      <CheckboxGroup size="lg" v-model="groupSizeValues">
        <Checkbox value="apple">苹果</Checkbox>
        <Checkbox value="banana">香蕉</Checkbox>
        <Checkbox value="orange" size="sm">橙子 (sm 覆盖)</Checkbox>
      </CheckboxGroup>
      <p class="text-sm text-gray-600">已选择：{{ groupSizeValues.join(', ') }}</p>
    </Space>
  </div>
</template>
