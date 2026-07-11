<script setup lang="ts">
import { VirtualList } from '@expcat/tigercat-vue/VirtualList'
</script>

<template>
  <VirtualList :item-count="10000" :item-height="40" :height="300" :overscan="10">
    <template #default="{ index }">
      <div class="flex h-full items-center px-4" :class="index % 2 === 0 ? 'bg-gray-50' : ''">
        第 {{ index + 1 }} 行
      </div>
    </template>
  </VirtualList>
</template>
