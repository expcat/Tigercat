<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'

const sizes = ['xs', 'base', 'lg', '2xl', '4xl'] as const
const weights = ['normal', 'medium', 'semibold', 'bold', 'black'] as const
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-baseline gap-4">
      <Text v-for="size in sizes" :key="size" tag="span" :size="size">{{ size }}</Text>
    </div>
    <div class="flex flex-wrap items-baseline gap-4">
      <Text v-for="weight in weights" :key="weight" tag="span" size="lg" :weight="weight">{{ weight }}</Text>
    </div>
  </div>
</template>
