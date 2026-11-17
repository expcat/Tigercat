<script setup lang="ts">
import { ref } from 'vue'
import { AspectRatio } from '@expcat/tigercat-vue/AspectRatio'
import { demoImageAfter as cover } from '@demo-shared/demo-images'

const ratio = ref('16/9')
const options = ['16/9', '4/3', '1/1'] as const
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <AspectRatio
      :ratio="ratio"
      fit="cover"
      class="rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
      <img :src="cover" alt="" />
      <div class="absolute inset-x-0 bottom-0 bg-black/40 px-4 py-3 backdrop-blur-sm">
        <p class="text-sm font-medium text-white">课程封面：响应式布局实战</p>
        <p class="text-xs text-white/80">覆盖层铺在媒体上，圆角由比例盒裁切</p>
      </div>
    </AspectRatio>
    <div class="flex items-center gap-2">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="rounded-md border px-3 py-1.5 font-mono text-xs transition-colors"
        :class="
          ratio === option
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
        "
        @click="ratio = option">
        {{ option }}
      </button>
    </div>
  </div>
</template>
