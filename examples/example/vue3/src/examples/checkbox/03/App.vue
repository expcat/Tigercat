<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-vue/CheckboxGroup'

const values = ref<(string | number | boolean)[]>(['email'])
</script>

<template>
  <CheckboxGroup v-model="values" size="lg">
    <Checkbox value="email">邮件</Checkbox>
    <Checkbox value="sms">短信</Checkbox>
    <Checkbox value="app">应用内</Checkbox>
  </CheckboxGroup>
</template>
