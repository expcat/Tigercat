<script setup lang="ts">
import { QRCode } from '@expcat/tigercat-vue/QRCode'
import { Space } from '@expcat/tigercat-vue/Space'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import type { DemoLang } from '@demo-shared/app-config'
import { computed, inject, ref, type Ref } from 'vue'

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const locale = computed(() => getDemoTigerLocale(demoLang.value))
const handleRefresh = () => {
  console.log('刷新二维码')
}
</script>

<template>
  <div class="min-w-0">
    <Space wrap>
      <QRCode value="https://github.com" color="#1677ff" :locale="locale" />
      <QRCode value="https://github.com" color="#52c41a" bg-color="#f6ffed" :locale="locale" />
      <QRCode value="https://github.com" level="H" :locale="locale" />
      <QRCode value="https://github.com" level="L" :locale="locale" />
    </Space>
  </div>
</template>
