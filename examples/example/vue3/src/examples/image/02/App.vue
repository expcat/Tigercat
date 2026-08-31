<script setup lang="ts">
import { Image } from '@expcat/tigercat-vue/Image'

const fallbackPhoto =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150"><rect width="100%" height="100%" fill="#d1fae5"/><text x="50%" y="54%" text-anchor="middle" fill="#065f46" font-size="16">fallback</text></svg>'
  )
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <Image
      src="/missing-photo.jpg"
      :fallback-src="fallbackPhoto"
      alt="回退到本地图形"
      :width="240"
      :height="150"
      :preview="false" />
    <Image
      src="/missing-photo.jpg"
      fallback-src="/also-missing.jpg"
      alt="二次失败"
      :width="240"
      :height="150"
      :preview="false">
      <template #error>
        <div
          class="flex h-full w-full items-center justify-center text-sm text-[var(--tiger-text-secondary)]">
          无法加载
        </div>
      </template>
    </Image>
    <Image :src="fallbackPhoto" alt="懒加载占位" :width="240" :height="150" lazy :preview="false">
      <template #placeholder>
        <div
          class="flex h-full w-full items-center justify-center text-sm text-[var(--tiger-text-secondary)]">
          加载中
        </div>
      </template>
    </Image>
  </div>
</template>
