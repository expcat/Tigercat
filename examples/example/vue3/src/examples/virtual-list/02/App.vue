<script setup lang="ts">
import { VirtualList } from '@expcat/tigercat-vue/VirtualList'

const getItemHeight = (index: number) => (index % 5 === 0 ? 64 : 40)
</script>

<template>
  <VirtualList
    :item-count="2000"
    :get-item-height="getItemHeight"
    :height="400"
    aria-label="Variable rows">
    <template #default="{ index }">
      <div class="flex h-full items-center px-4">
        第 {{ index + 1 }} 行 · {{ getItemHeight(index) }}px
      </div>
    </template>
  </VirtualList>
</template>
