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
      <Checkbox
        :model-value="allChecked"
        :indeterminate="indeterminate"
        @change="handleCheckAllChange">
        全选
      </Checkbox>
      <CheckboxGroup v-model="fruitsIndeterminate">
        <div class="flex flex-wrap gap-4">
          <Checkbox :value="options[0]">苹果</Checkbox>
          <Checkbox :value="options[1]">香蕉</Checkbox>
          <Checkbox :value="options[2]">橙子</Checkbox>
        </div>
      </CheckboxGroup>
      <p class="text-sm text-gray-600">已选择：{{ fruitsIndeterminate.join(', ') }}</p>
    </Space>
  </div>
</template>
