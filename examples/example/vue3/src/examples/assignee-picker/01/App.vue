<script setup lang="ts">
import { ref } from 'vue'
import { AssigneePicker } from '@expcat/tigercat-vue/AssigneePicker'
import type { AssigneePickerOption } from '@expcat/tigercat-core'

const options: AssigneePickerOption[] = [
  { id: 'ada', name: 'Ada', department: 'Ops' },
  { id: 'bea', name: 'Bea', department: 'Design' }
]
const selectedIds = ref<string[]>([])
</script>

<template>
  <AssigneePicker v-model:selected-ids="selectedIds" :options="options" />
</template>
