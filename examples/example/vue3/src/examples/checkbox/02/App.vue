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
    <Space>
      <Checkbox :default-value="true">默认选中</Checkbox>
      <Checkbox>默认未选中</Checkbox>
    </Space>
  </div>
</template>
