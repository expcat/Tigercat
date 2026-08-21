<script setup lang="ts">
import { ref } from 'vue'
import { AspectRatio } from '@expcat/tigercat-vue/AspectRatio'

const ratio = ref('16/9')
const options = ['16/9', '4/3', '1/1'] as const
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <AspectRatio
      :ratio="ratio"
      class="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700"
      content-class-name="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500">
      <div class="relative h-full">
        <div class="absolute inset-x-0 bottom-0 bg-black/40 px-4 py-3 backdrop-blur-sm">
          <p class="text-sm font-medium text-white">课程封面：响应式布局实战</p>
          <p class="text-xs text-white/80">子内容铺满比例框，随比例切换重排</p>
        </div>
        <div class="flex h-full items-center justify-center">
          <span class="sr-only">封面区域</span>
        </div>
      </div>
    </AspectRatio>
    <div class="flex items-center gap-2">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="rounded-md border border-gray-300 px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        :class="
          ratio === option
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
            : ''
        "
        @click="ratio = option">
        {{ option }}
      </button>
    </div>
  </div>
</template>
