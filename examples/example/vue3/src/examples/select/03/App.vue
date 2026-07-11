<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<(string | number)[]>(['typescript'])
const skills = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Node.js', value: 'node' }
]
</script>

<template>
  <Select
    v-model="value"
    :options="skills"
    multiple
    searchable
    placeholder="搜索并多选技能"
    class="w-full max-w-sm" />
</template>
