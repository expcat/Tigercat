<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'

const sizes = ['sm', 'md', 'lg'] as const
const cover = 'https://picsum.photos/seed/tiger-card-pad/480/192'
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card v-for="size in sizes" :key="size" variant="bordered" :size="size">
        <template #header>
          <span class="font-medium">size={{ size }}</span>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-300">尺寸决定内边距密度。</p>
      </Card>
    </div>
    <Card variant="bordered" size="md" :cover="cover" cover-alt="">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        有封面时 padding 打在内容列，封面贴边。
      </p>
    </Card>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card variant="bordered" padding="p-8">
        <p class="text-sm text-gray-600 dark:text-gray-300">padding="p-8" 覆盖尺寸内边距。</p>
      </Card>
      <Card variant="bordered" :padding="false">
        <div class="bg-blue-500 px-4 py-6 text-sm text-white">
          padding=false：内容自行控制边距。
        </div>
      </Card>
    </div>
  </div>
</template>
