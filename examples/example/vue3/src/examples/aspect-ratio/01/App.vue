<script setup lang="ts">
import { AspectRatio } from '@expcat/tigercat-vue/AspectRatio'
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <figure>
      <AspectRatio
        class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        content-class-name="bg-gradient-to-br from-blue-500 to-indigo-600">
        <div class="flex h-full items-center justify-center">
          <span class="text-sm font-medium text-white">默认比例 16/9</span>
        </div>
      </AspectRatio>
      <figcaption class="mt-2 text-sm text-gray-600 dark:text-gray-300">
        省略 ratio 时使用 16/9，宽度撑满父容器，高度按比例推导。
      </figcaption>
    </figure>
    <AspectRatio
      ratio="4/3"
      class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
      content-class-name="bg-gradient-to-br from-emerald-500 to-teal-600">
      <div class="flex h-full items-center justify-center">
        <span class="text-sm font-medium text-white">分数字符串 4/3</span>
      </div>
    </AspectRatio>
  </div>
</template>
