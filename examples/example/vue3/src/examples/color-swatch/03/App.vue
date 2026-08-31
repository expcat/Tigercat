<script setup lang="ts">
import { ref } from 'vue'
import { ColorSwatch } from '@expcat/tigercat-vue/ColorSwatch'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

const color = ref('#22c55e')
const palette = [
  '#0ea5e9',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#64748b'
]
</script>

<template>
  <ConfigProvider :locale="zhTW">
    <div class="space-y-4" dir="rtl">
      <ColorSwatch v-model="color" :colors="palette" :columns="4" />
    </div>
  </ConfigProvider>
</template>
