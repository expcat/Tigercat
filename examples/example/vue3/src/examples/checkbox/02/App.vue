<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-vue/CheckboxGroup'

const options = ['email', 'sms', 'app'] as const
const values = ref<string[]>(['email'])
const allChecked = computed(() => values.value.length === options.length)
const indeterminate = computed(() => values.value.length > 0 && !allChecked.value)

function onToggleAll(checked: boolean) {
  values.value = checked ? [...options] : []
}
</script>

<template>
  <div class="space-y-3">
    <Checkbox :model-value="allChecked" :indeterminate="indeterminate" @change="onToggleAll">
      全选
    </Checkbox>
    <CheckboxGroup v-model="values" aria-label="通知渠道">
      <Checkbox value="email">邮件</Checkbox>
      <Checkbox value="sms">短信</Checkbox>
      <Checkbox value="app">应用内</Checkbox>
    </CheckboxGroup>
  </div>
</template>
