<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@expcat/tigercat-vue/AutoComplete'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const value = ref<string | number | undefined>()
const options = ['React', 'Vue', 'Svelte', 'Angular'].map((item) => ({
  label: item,
  value: item
}))
</script>

<template>
  <FormItem label="框架" class="w-full max-w-sm">
    <AutoComplete v-model="value" :options="options" placeholder="输入框架名称" clearable />
  </FormItem>
</template>
