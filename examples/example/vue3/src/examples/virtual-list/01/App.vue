<script setup lang="ts">
import { VirtualList } from '@expcat/tigercat-vue/VirtualList'

const virtualListStripeClasses =
  'bg-[var(--tiger-virtuallist-stripe,var(--tiger-surface-muted,#f9fafb))]'
</script>

<template>
  <VirtualList :item-count="10000" :item-height="40" :height="300" :overscan="10">
    <template #default="{ index }">
      <div
        class="flex h-full items-center px-4"
        :class="index % 2 === 0 ? virtualListStripeClasses : ''">
        第 {{ index + 1 }} 行
      </div>
    </template>
  </VirtualList>
</template>
