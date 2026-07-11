<script setup lang="ts">
import { ref } from 'vue'
import { ScrollSpy } from '@expcat/tigercat-vue/ScrollSpy'
import type { ScrollSpyItem } from '@expcat/tigercat-vue'

const items: ScrollSpyItem[] = [
  { key: 'audit', href: '#spy-audit', label: '审计' },
  { key: 'release', href: '#spy-release', label: '发布' }
]

const containerRef = ref<HTMLElement | null>(null)
const activeLabel = ref('审计')
const getContainer = () => containerRef.value ?? window
const handleChange = (_key: string | number, item: ScrollSpyItem) => {
  activeLabel.value = item.label
}
</script>

<template>
  <div>
    <div class="grid gap-4 md:grid-cols-[1fr_160px]">
      <div ref="containerRef" class="h-64 overflow-auto rounded border">
        <section id="spy-audit" class="h-52 bg-blue-50 p-4">审计</section>
        <section id="spy-release" class="h-52 bg-green-50 p-4">发布</section>
      </div>
      <ScrollSpy :items="items" :get-container="getContainer" @change="handleChange" />
    </div>
    <p class="mt-2 text-sm text-gray-500">当前：{{ activeLabel }}</p>
  </div>
</template>
