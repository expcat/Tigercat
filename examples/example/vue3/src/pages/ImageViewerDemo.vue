<script setup lang="ts">
import { ref } from 'vue'
import { ImageViewer, Button, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const open1 = ref(false)
const open2 = ref(false)
const currentIdx = ref(0)

const images = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4'
]

const basicSnippet = `<Button @click="open1 = true">查看图片</Button>
<ImageViewer
  v-model:open="open1"
  :images="images"
/>`

const featureSnippet = `<Button @click="open2 = true">打开查看器（第2张）</Button>
<ImageViewer
  v-model:open="open2"
  :images="images"
  :current-index="1"
  :zoomable="true"
  :rotatable="true"
  :show-nav="true"
  :show-counter="true"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">ImageViewer 图片查看器</h1>
    <p class="text-gray-500 mb-8">全屏图片预览，支持缩放、旋转和多图切换。</p>

    <DemoBlock title="基本用法" description="点击按钮打开图片查看器" :code="basicSnippet">
      <Button @click="open1 = true">查看图片</Button>
      <ImageViewer v-model:open="open1" :images="images" />
    </DemoBlock>

    <DemoBlock title="全部功能" description="缩放、旋转、导航按钮和计数器" :code="featureSnippet">
      <Button @click="open2 = true">打开查看器（第2张）</Button>
      <ImageViewer
        v-model:open="open2"
        :images="images"
        :current-index="1"
        :zoomable="true"
        :rotatable="true"
        :show-nav="true"
        :show-counter="true" />
    </DemoBlock>
  </div>
</template>
