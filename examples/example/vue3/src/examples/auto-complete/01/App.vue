<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@expcat/tigercat-vue/AutoComplete'

const value = ref('')
const options = ['React', 'Vue', 'Svelte', 'Angular'].map((item) => ({
  label: item,
  value: item
}))
</script>

<template>
  <AutoComplete
    v-model="value"
    :options="options"
    placeholder="输入框架名称"
    class="w-full max-w-sm" />
</template>
