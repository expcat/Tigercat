<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@expcat/tigercat-vue/Rate'

const value = ref(3.5)
</script>

<template>
  <div class="space-y-2">
    <Rate v-model="value" allow-half size="lg" character="★" />
    <p class="text-sm text-gray-500">当前评分：{{ value }}</p>
  </div>
</template>
