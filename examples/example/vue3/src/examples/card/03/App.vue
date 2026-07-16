<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card v-for="size in sizes" :key="size" variant="bordered" :size="size">
        <template #header>
          <span class="font-medium">size={{ size }}</span>
        </template>
        <p class="text-sm text-gray-600">尺寸决定内边距密度。</p>
      </Card>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card variant="bordered" padding="p-8">
        <p class="text-sm text-gray-600">padding="p-8" 覆盖尺寸内边距。</p>
      </Card>
      <Card variant="bordered" :padding="false">
        <div class="bg-blue-500 px-4 py-6 text-sm text-white">padding=false：内容自行控制边距。</div>
      </Card>
    </div>
  </div>
</template>
