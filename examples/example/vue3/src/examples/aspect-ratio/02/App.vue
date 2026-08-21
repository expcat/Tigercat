<script setup lang="ts">
import { AspectRatio } from '@expcat/tigercat-vue/AspectRatio'

const ratios = [
  { label: '1/1', value: '1/1' },
  { label: '4/3', value: '4/3' },
  { label: '16/9', value: '16/9' },
  { label: '21/9', value: '21/9' }
] as const
</script>

<template>
  <div class="w-full max-w-2xl space-y-4">
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <figure v-for="ratio in ratios" :key="ratio.value">
        <AspectRatio
          :ratio="ratio.value"
          class="overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex h-full items-center justify-center">
            <span class="font-mono text-sm text-gray-700 dark:text-gray-200">{{
              ratio.label
            }}</span>
          </div>
        </AspectRatio>
        <figcaption class="mt-1.5 text-center text-xs text-gray-500 dark:text-gray-400">
          {{ ratio.label }}
        </figcaption>
      </figure>
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      数字（如 1.5）与分数字符串（如 '21/9'）都可作为 ratio，非法值回退到 16/9。
    </p>
  </div>
</template>
