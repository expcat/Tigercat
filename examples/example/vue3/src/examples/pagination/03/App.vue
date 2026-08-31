<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const current = ref(2)
const rows = [
  { size: 'small', align: 'start' },
  { size: 'medium', align: 'center' },
  { size: 'large', align: 'end' }
] as const
</script>

<template>
  <div class="space-y-4">
    <div v-for="row in rows" :key="row.size">
      <p class="mb-1 text-sm text-gray-500">size={{ row.size }} · align={{ row.align }}</p>
      <Pagination v-model:current="current" :total="120" :size="row.size" :align="row.align" />
    </div>
  </div>
</template>
