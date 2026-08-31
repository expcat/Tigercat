<script setup lang="ts">
import { Tag } from '@expcat/tigercat-vue/Tag'

const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <Tag v-for="variant in variants" :key="variant" :variant="variant">{{ variant }}</Tag>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Tag variant="warning" size="sm">warning sm</Tag>
      <Tag variant="success" size="sm">success sm</Tag>
      <Tag pill variant="info">pill</Tag>
    </div>
  </div>
</template>
