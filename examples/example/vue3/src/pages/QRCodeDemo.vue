<script setup lang="ts">
import { ref } from 'vue'
import { QRCode, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const url = ref('https://github.com/nicepkg/tigercat')

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
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">QRCode 二维码</h1>
    <p class="text-gray-500 mb-8">将文本转换为二维码，支持自定义颜色、大小和纠错等级。</p>

    <DemoBlock title="基本用法与尺寸" description="通过 size 控制二维码大小" :code="basicSnippet">
      <Space wrap>
        <QRCode value="https://github.com" />
        <QRCode value="https://github.com" :size="200" />
        <QRCode value="https://github.com" :size="80" />
      </Space>
    </DemoBlock>

    <DemoBlock title="颜色与纠错等级" description="自定义颜色，level 控制纠错等级 L/M/Q/H" :code="styleSnippet">
      <Space wrap>
        <QRCode value="https://github.com" color="#1677ff" />
        <QRCode value="https://github.com" color="#52c41a" bg-color="#f6ffed" />
        <QRCode value="https://github.com" level="H" />
        <QRCode value="https://github.com" level="L" />
      </Space>
    </DemoBlock>

    <DemoBlock title="状态" description="active（正常）、expired（已过期）、loading（加载中）" :code="statusSnippet">
      <Space wrap>
        <QRCode value="https://github.com" status="active" />
        <QRCode value="https://github.com" status="expired" />
        <QRCode value="https://github.com" status="loading" />
      </Space>
    </DemoBlock>
  </div>
</template>
