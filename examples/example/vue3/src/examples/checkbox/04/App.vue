<script setup lang="ts">
import { ref } from 'vue'
import { CheckboxGroup } from '@expcat/tigercat-vue/CheckboxGroup'

const values = ref<(string | number | boolean)[]>(['email'])
const options = [
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: '传真', value: 'fax', disabled: true }
]
</script>

<template>
  <CheckboxGroup v-model="values" :options="options" aria-label="通知渠道" />
</template>
