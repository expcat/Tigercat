<script setup lang="ts">
import type { DemoModuleDescriptor } from '@demo-shared/playground/types'
import DemoBlock from './DemoBlock.vue'

defineProps<{
  title: string
  description?: string
  modules: DemoModuleDescriptor[]
}>()
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 dark:text-gray-100">{{ title }}</h1>
      <p v-if="description" class="text-gray-600 dark:text-gray-400">{{ description }}</p>
    </div>
    <DemoBlock v-for="demoModule in modules" :key="demoModule.meta.id" :module="demoModule" />
  </div>
</template>
