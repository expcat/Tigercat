<script setup lang="ts">
import { ScrollSpy } from '@expcat/tigercat-vue/ScrollSpy'
import type { ScrollSpyItem } from '@expcat/tigercat-vue'

const items: ScrollSpyItem[] = [
  { key: 'overview', href: '#spy-overview', label: '概览' },
  { key: 'workflow', href: '#spy-workflow', label: '工作流' }
]
</script>

<template>
  <div class="space-y-4">
    <ScrollSpy :items="items" direction="horizontal" />
    <div class="grid gap-4 md:grid-cols-[1fr_160px]">
      <div class="max-h-64 overflow-auto rounded border">
        <section id="spy-overview" class="min-h-[28rem] bg-blue-50 p-4">概览</section>
        <section id="spy-workflow" class="min-h-[28rem] bg-green-50 p-4">工作流</section>
      </div>
      <ScrollSpy :items="items" sticky direction="vertical" />
    </div>
  </div>
</template>
