<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker, Space, Text } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const color = ref('#2563eb')
const color2 = ref('#2563eb')

const basicSnippet = `<ColorPicker v-model="color" />
<Text>选中颜色: {{ color }}</Text>`

const featureSnippet = `<Space direction="vertical" :size="12">
  <ColorPicker v-model="color" show-alpha format="rgb" />
  <ColorPicker v-model="color" :presets="['#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1']" />
  <ColorPicker :model-value="'#ccc'" size="sm" />
  <ColorPicker :model-value="'#ccc'" size="lg" />
  <ColorPicker :model-value="'#ccc'" disabled />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">ColorPicker 颜色选择器</h1>
    <p class="text-gray-500 mb-8">用于选择颜色，支持透明度、预设颜色和多种格式。</p>

    <DemoBlock title="基本用法" :code="basicSnippet">
      <Space :size="16" align="center">
        <ColorPicker v-model="color" />
        <Text>选中颜色: {{ color }}</Text>
      </Space>
    </DemoBlock>

    <DemoBlock title="透明度、预设与尺寸" description="showAlpha 透明度，presets 预设色板" :code="featureSnippet">
      <Space direction="vertical" :size="12">
        <ColorPicker v-model="color2" show-alpha format="rgb" />
        <ColorPicker v-model="color2" :presets="['#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1']" />
        <Space :size="12">
          <ColorPicker :model-value="'#ccc'" size="sm" />
          <ColorPicker :model-value="'#ccc'" size="lg" />
          <ColorPicker :model-value="'#ccc'" disabled />
        </Space>
      </Space>
    </DemoBlock>
  </div>
</template>
