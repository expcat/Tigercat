<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'

const sizes = ['sm', 'md', 'lg'] as const
const value = ref<number | [number, number]>(60)
</script>

<template>
  <div class="w-full max-w-lg space-y-6">
    <div v-for="size in sizes" :key="size">
      <p class="mb-1 text-sm text-gray-500">size={{ size }}</p>
      <Slider v-model="value" :size="size" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">disabled + tooltip=false</p>
      <Slider :model-value="40" disabled :tooltip="false" />
    </div>
  </div>
</template>
