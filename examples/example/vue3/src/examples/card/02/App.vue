<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'

const variants = ['default', 'bordered', 'shadow', 'elevated', 'transparent'] as const
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Card v-for="variant in variants" :key="variant" :variant="variant">
      <template #header>
        <span class="font-medium">{{ variant }}</span>
      </template>
      <p class="text-sm text-gray-600">variant="{{ variant }}"</p>
    </Card>
  </div>
</template>
