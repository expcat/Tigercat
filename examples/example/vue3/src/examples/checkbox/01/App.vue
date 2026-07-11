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
      <Checkbox v-model="checked">复选框</Checkbox>
      <p class="text-sm text-gray-600">选中状态：{{ checked }}</p>
    </Space>
  </div>
</template>
