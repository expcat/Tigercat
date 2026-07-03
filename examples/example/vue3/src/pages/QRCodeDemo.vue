<script setup lang="ts">
import { QRCode } from '@expcat/tigercat-vue/QRCode'
import { Space } from '@expcat/tigercat-vue/Space'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import type { DemoLang } from '@demo-shared/app-config'
import { computed, inject, ref, type Ref } from 'vue'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './QRCodeDemo.vue?raw'

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const locale = computed(() => getDemoTigerLocale(demoLang.value))
const handleRefresh = () => {
  console.log('刷新二维码')
}

const basicSnippet = `<Space wrap>
  <QRCode value="https://github.com" />
  <QRCode value="https://github.com" :size="200" />
  <QRCode value="https://github.com" :size="80" />
</Space>`

const styleSnippet = `<Space wrap>
  <QRCode value="https://github.com" color="#1677ff" />
  <QRCode value="https://github.com" color="#52c41a" bg-color="#f6ffed" />
  <QRCode value="https://github.com" level="H" />
  <QRCode value="https://github.com" level="L" />
</Space>`

const statusSnippet = `<Space wrap>
  <QRCode value="https://github.com" status="active" />
  <QRCode value="https://github.com" status="expired" />
  <QRCode value="https://github.com" status="loading" />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">QRCode 二维码</h1>
    <p class="text-gray-500 mb-8">将文本转换为二维码，支持自定义颜色、大小和纠错等级。</p>

    <DemoBlock
      title="基本用法与尺寸"
      description="通过 size 控制二维码大小"
      :code="fullPageSnippet">
      <Space wrap>
        <QRCode value="https://github.com" :locale="locale" />
        <QRCode value="https://github.com" :size="200" :locale="locale" />
        <QRCode value="https://github.com" :size="80" :locale="locale" />
      </Space>
    </DemoBlock>

    <DemoBlock
      title="颜色与纠错等级"
      description="自定义颜色，level 控制纠错等级 L/M/Q/H"
      :code="fullPageSnippet">
      <Space wrap>
        <QRCode value="https://github.com" color="#1677ff" :locale="locale" />
        <QRCode value="https://github.com" color="#52c41a" bg-color="#f6ffed" :locale="locale" />
        <QRCode value="https://github.com" level="H" :locale="locale" />
        <QRCode value="https://github.com" level="L" :locale="locale" />
      </Space>
    </DemoBlock>

    <DemoBlock
      title="状态"
      description="active（正常）、expired（已过期）、loading（加载中）"
      :code="fullPageSnippet">
      <Space wrap>
        <QRCode value="https://github.com" status="active" :locale="locale" />
        <QRCode
          value="https://github.com"
          status="expired"
          :locale="locale"
          @refresh="handleRefresh" />
        <QRCode value="https://github.com" status="loading" :locale="locale" />
      </Space>
    </DemoBlock>
  </div>
</template>
