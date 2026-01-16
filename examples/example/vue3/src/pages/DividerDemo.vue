<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<div class="text-gray-700">上方内容</div>
<Divider />
<div class="text-gray-700">下方内容</div>`

const lineStyleSnippet = `<div>
  <div class="text-sm text-gray-600">solid</div>
  <Divider line-style="solid" />
</div>
<div>
  <div class="text-sm text-gray-600">dashed</div>
  <Divider line-style="dashed" />
</div>
<div>
  <div class="text-sm text-gray-600">dotted</div>
  <Divider line-style="dotted" />
</div>`

const spacingSnippet = `<div class="text-gray-700">spacing="sm"</div>
<Divider spacing="sm" />
<div class="text-gray-700">spacing="md"</div>
<Divider spacing="md" />
<div class="text-gray-700">spacing="lg"</div>
<Divider spacing="lg" />`

const customSnippet = `<div class="text-gray-700">color="#2563eb" thickness="2px"</div>
<Divider color="#2563eb" thickness="2px" />
<div class="text-gray-700">color="#10b981" thickness="4px"（dashed）</div>
<Divider color="#10b981" thickness="4px" line-style="dashed" />`

const verticalSnippet = `<div class="flex items-center h-12">
  <span class="text-gray-700">Left</span>
  <Divider orientation="vertical" class="h-6" />
  <span class="text-gray-700">Middle</span>
  <Divider orientation="vertical" class="h-6" line-style="dashed" />
  <span class="text-gray-700">Right</span>
</div>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Divider 分割线</h1>
      <p class="text-gray-600">区隔内容的分割线。</p>
    </div>

    <DemoBlock title="基础用法"
               description="默认水平分割线。"
               :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-gray-700">上方内容</div>
        <Divider />
        <div class="text-gray-700">下方内容</div>
      </div>
    </DemoBlock>

    <DemoBlock title="线条样式"
               description="lineStyle 支持 solid / dashed / dotted。"
               :code="lineStyleSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">solid</div>
        <Divider line-style="solid" />
        <div class="text-sm text-gray-600">dashed</div>
        <Divider line-style="dashed" />
        <div class="text-sm text-gray-600">dotted</div>
        <Divider line-style="dotted" />
      </div>
    </DemoBlock>

    <DemoBlock title="间距"
               description="spacing 控制分割线周围留白。"
               :code="spacingSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-gray-700">spacing="sm"</div>
        <Divider spacing="sm" />
        <div class="text-gray-700">spacing="md"</div>
        <Divider spacing="md" />
        <div class="text-gray-700">spacing="lg"</div>
        <Divider spacing="lg" />
      </div>
    </DemoBlock>

    <DemoBlock title="自定义颜色与粗细"
               description="通过 color / thickness 自定义边框颜色与宽度。"
               :code="customSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-gray-700">color="#2563eb" thickness="2px"</div>
        <Divider color="#2563eb"
                 thickness="2px" />
        <div class="text-gray-700">color="#10b981" thickness="4px"（dashed）</div>
        <Divider color="#10b981"
                 thickness="4px"
                 line-style="dashed" />
      </div>
    </DemoBlock>

    <DemoBlock title="垂直分割线"
               description='orientation="vertical" 用于行内内容分隔。'
               :code="verticalSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex items-center h-12">
          <span class="text-gray-700">Left</span>
          <Divider orientation="vertical"
                   class="h-6" />
          <span class="text-gray-700">Middle</span>
          <Divider orientation="vertical"
                   class="h-6"
                   line-style="dashed" />
          <span class="text-gray-700">Right</span>
        </div>
      </div>
    </DemoBlock>
  </div>
</template>
