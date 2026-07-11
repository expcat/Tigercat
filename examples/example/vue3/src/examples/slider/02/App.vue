<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'

const range = ref<number | [number, number]>([20, 70])
</script>

<template>
  <div class="w-full max-w-lg space-y-2">
    <Slider v-model="range" range :min="0" :max="100" :step="10" />
    <p class="text-sm text-gray-600 dark:text-gray-300">选择范围：{{ String(range) }}</p>
  </div>
</template>
