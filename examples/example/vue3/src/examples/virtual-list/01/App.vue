<script setup lang="ts">
import { VirtualList } from '@expcat/tigercat-vue/VirtualList'
</script>

<template>
  <VirtualList :item-count="10000" :item-height="40" aria-label="Rows">
    <template #default="{ index }">
      <div
        class="flex h-full items-center px-4"
        :class="index % 2 === 0 ? 'bg-[var(--tiger-surface-muted,#f9fafb)]' : ''">
        第 {{ index + 1 }} 行
      </div>
    </template>
  </VirtualList>
</template>
