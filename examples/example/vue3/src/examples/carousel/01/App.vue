<script setup lang="ts">
import { Carousel } from '@expcat/tigercat-vue/Carousel'
</script>

<template>
  <Carousel>
    <div
      class="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg bg-blue-600 p-6 text-white">
      <p>默认滚动 · 第一页</p>
      <button type="button" class="rounded bg-white px-3 py-1 text-blue-700">仅当前页可 Tab</button>
    </div>
    <div class="flex min-h-40 items-center justify-center rounded-lg bg-blue-700 p-6 text-white">
      <a href="#carousel-next" class="underline">第二页链接</a>
    </div>
    <div
      class="flex min-h-28 items-center justify-center rounded-lg bg-blue-800 p-6 text-lg text-white">
      第三页
    </div>
  </Carousel>
</template>
