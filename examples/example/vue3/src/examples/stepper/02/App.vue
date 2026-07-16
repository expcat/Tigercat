<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'

const value = ref(3)
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-3">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-3">
      <span class="w-8 text-sm text-gray-500">{{ size }}</span>
      <Stepper v-model="value" :size="size" />
    </div>
  </div>
</template>
