<script setup lang="ts">
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
</script>

<template>
  <ConfigProvider :locale="zhTW">
    <div class="flex flex-wrap items-center gap-6">
      <div class="flex items-center gap-2">
        <ColorPicker default-value="#059669" />
        <span class="text-sm text-gray-500">非受控</span>
      </div>
      <div class="flex items-center gap-2">
        <ColorPicker default-value="rgba(245, 158, 11, 0)" show-alpha format="rgb" />
        <span class="text-sm text-gray-500">alpha=0</span>
      </div>
      <div class="flex items-center gap-2">
        <ColorPicker model-value="#94a3b8" disabled />
        <span class="text-sm text-gray-500">disabled</span>
      </div>
    </div>
  </ConfigProvider>
</template>
