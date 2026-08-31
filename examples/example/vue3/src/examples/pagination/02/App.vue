<script setup lang="ts">
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Pagination } from '@expcat/tigercat-vue/Pagination'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">zh-CN，不传 labels</p>
      <ConfigProvider :locale="zhCN">
        <Pagination :total="96" show-quick-jumper show-size-changer />
      </ConfigProvider>
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">zh-TW</p>
      <ConfigProvider :locale="zhTW">
        <Pagination :total="96" show-quick-jumper />
      </ConfigProvider>
    </div>
  </div>
</template>
