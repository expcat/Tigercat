<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'

const value = ref<number | [number, number]>(40)
</script>

<template>
  <div class="w-full max-w-lg space-y-2">
    <Slider v-model="value" :min="0" :max="100" :step="5" />
    <p class="text-sm text-gray-600 dark:text-gray-300">当前值：{{ String(value) }}</p>
  </div>
</template>
