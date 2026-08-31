<script setup lang="ts">
import { Carousel } from '@expcat/tigercat-vue/Carousel'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
</script>

<template>
  <ConfigProvider :locale="zhTW">
    <Carousel>
      <div
        class="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg bg-blue-600 p-6 text-white">
        <p>預設滾動 · 第一頁</p>
        <button type="button" class="rounded bg-white px-3 py-1 text-blue-700">
          僅當前頁可 Tab
        </button>
      </div>
      <div class="flex min-h-40 items-center justify-center rounded-lg bg-blue-700 p-6 text-white">
        <a href="#carousel-next" class="underline">第二頁連結</a>
      </div>
      <div
        class="flex min-h-28 items-center justify-center rounded-lg bg-blue-800 p-6 text-lg text-white">
        第三頁
      </div>
    </Carousel>
  </ConfigProvider>
</template>
