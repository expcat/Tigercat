<script setup lang="ts">
import { Splitter } from '@expcat/tigercat-vue/Splitter'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './SplitterDemo.vue?raw'

const horizontalSnippet = `<Splitter direction="horizontal" :sizes="[30, 70]" style="height: 200px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <div class="p-4">左侧面板 (30px)</div>
  <div class="p-4">右侧面板 (70px)</div>
</Splitter>`

const verticalSnippet = `<Splitter direction="vertical" :sizes="[40, 60]" style="height: 300px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <div class="p-4">上方面板</div>
  <div class="p-4">下方面板</div>
</Splitter>`

const nestedSnippet = `<Splitter direction="horizontal" :sizes="[25, 75]" style="height: 300px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <div class="p-4 bg-gray-50">侧边栏</div>
  <Splitter direction="vertical" :sizes="[60, 40]">
    <div class="p-4">内容区</div>
    <div class="p-4 bg-gray-50">底部面板</div>
  </Splitter>
</Splitter>`

const minSnippet = `<Splitter direction="horizontal" :sizes="[30, 70]" :min="100" style="height: 200px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <div class="p-4">最小宽度面板</div>
  <div class="p-4">主内容区</div>
</Splitter>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">Splitter 分割面板</h1>
    <p class="text-gray-500 mb-8">可拖拽分割面板，支持水平/垂直、嵌套和最小尺寸。</p>

    <DemoBlock title="水平分割" description="拖拽分割条调整面板大小" :code="fullPageSnippet">
      <Splitter
        direction="horizontal"
        :sizes="[30, 70]"
        style="height: 200px; border: 1px solid #e5e7eb; border-radius: 8px">
        <div class="p-4">左侧面板 (30px)</div>
        <div class="p-4">右侧面板 (70px)</div>
      </Splitter>
    </DemoBlock>

    <DemoBlock title="垂直分割" :code="fullPageSnippet">
      <Splitter
        direction="vertical"
        :sizes="[40, 60]"
        style="height: 300px; border: 1px solid #e5e7eb; border-radius: 8px">
        <div class="p-4">上方面板</div>
        <div class="p-4">下方面板</div>
      </Splitter>
    </DemoBlock>

    <DemoBlock title="嵌套分割" description="水平套垂直，实现 IDE 布局" :code="fullPageSnippet">
      <Splitter
        direction="horizontal"
        :sizes="[25, 75]"
        style="height: 300px; border: 1px solid #e5e7eb; border-radius: 8px">
        <div class="p-4 bg-gray-50 h-full">侧边栏</div>
        <Splitter direction="vertical" :sizes="[60, 40]">
          <div class="p-4">内容区</div>
          <div class="p-4 bg-gray-50">底部面板</div>
        </Splitter>
      </Splitter>
    </DemoBlock>

    <DemoBlock title="最小尺寸" description="min 限制面板最小尺寸" :code="fullPageSnippet">
      <Splitter
        direction="horizontal"
        :sizes="[30, 70]"
        :min="100"
        style="height: 200px; border: 1px solid #e5e7eb; border-radius: 8px">
        <div class="p-4">最小宽度面板</div>
        <div class="p-4">主内容区</div>
      </Splitter>
    </DemoBlock>
  </div>
</template>
