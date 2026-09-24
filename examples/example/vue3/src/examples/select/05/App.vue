<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'

const value = ref<Array<string | number>>([])
const people = [
  { label: 'Ada', value: 'a', description: 'Pilot' },
  { label: 'Bea', value: 'b', description: 'Navigator' },
  { label: 'Cam', value: 'c', description: 'Engineer' }
]
</script>

<template>
  <Select
    v-model="value"
    multiple
    searchable
    :max-count="2"
    :max-tag-count="1"
    :options="people"
    aria-label="People"
    class="w-full max-w-sm" />
</template>
