<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const current = ref(2)
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="mb-1 text-sm text-gray-500">simple（仅前后翻页）</p>
      <Pagination v-model:current="current" :total="120" simple align="left" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">disabled</p>
      <Pagination :current="3" :total="120" align="left" disabled />
    </div>
  </div>
</template>
