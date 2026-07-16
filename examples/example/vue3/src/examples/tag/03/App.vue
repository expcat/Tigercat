<script setup lang="ts">
import { Tag } from '@expcat/tigercat-vue/Tag'

const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Tag v-for="variant in variants" :key="variant" :variant="variant">{{ variant }}</Tag>
  </div>
</template>
