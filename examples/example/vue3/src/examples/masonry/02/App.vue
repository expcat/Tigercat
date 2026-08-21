<script setup lang="ts">
import { Masonry } from '@expcat/tigercat-vue/Masonry'

const heights = ['h-24', 'h-40', 'h-32', 'h-28', 'h-36', 'h-24', 'h-44', 'h-28']
const cards = heights.map((height, index) => ({
  id: index + 1,
  height,
  title: `卡片 ${index + 1}`
}))
</script>

<template>
  <div class="w-full max-w-2xl">
    <Masonry
      :columns="{ xs: 1, sm: 2, lg: 4 }"
      :gap="{ xs: 8, md: 16, lg: 24 }"
      aria-label="响应式瀑布流">
      <div
        v-for="card in cards"
        :key="card.id"
        class="flex items-center justify-center rounded-lg bg-emerald-50 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
        :class="card.height">
        {{ card.title }}
      </div>
    </Masonry>
    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">调整窗口宽度观察列数与间距变化。</p>
  </div>
</template>
