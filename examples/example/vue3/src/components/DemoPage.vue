<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { DemoLang } from '@demo-shared/app-config'
import { findDemoNavItem } from '@demo-shared/app-config'
import type { DemoModuleDescriptor } from '@demo-shared/playground/types'
import DemoBlock from './DemoBlock.vue'

const props = defineProps<{
  title: string
  description?: string
  modules: DemoModuleDescriptor[]
}>()

const route = useRoute()
const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const heading = computed(() => {
  const nav = findDemoNavItem(route.path)
  return nav?.label[demoLang.value] ?? props.title
})
const lead = computed(() => (demoLang.value === 'zh-CN' ? props.description : undefined))
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 dark:text-gray-100">{{ heading }}</h1>
      <p v-if="lead" class="text-gray-600 dark:text-gray-400">{{ lead }}</p>
    </div>
    <DemoBlock v-for="demoModule in modules" :key="demoModule.meta.id" :module="demoModule" />
  </div>
</template>
