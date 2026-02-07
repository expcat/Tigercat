<script setup lang="ts">
import { Text, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Space direction="vertical" class="w-full">
  <Text>这是一段默认段落文本。</Text>
  <Text tag="span" class="block">这是一段 span 文本（通过 class 设置为 block）。</Text>
  <Text tag="div">这是一段 div 文本。</Text>
</Space>`

const tagSnippet = `<Space direction="vertical" class="w-full">
  <Text tag="h3" size="lg" weight="semibold">Heading (h3)</Text>
  <Text tag="label" size="sm" color="muted">Label text</Text>
  <Text tag="p">Paragraph text</Text>
</Space>`

const colorSnippet = `<Space direction="vertical">
  <Text color="primary">主要文本 Primary</Text>
  <Text color="secondary">次要文本 Secondary</Text>
  <Text color="success">成功文本 Success</Text>
  <Text color="warning">警告文本 Warning</Text>
  <Text color="danger">危险文本 Danger</Text>
  <Text color="muted">弱化文本 Muted</Text>
  <Text>默认文本 Default</Text>
</Space>`

const sizeSnippet = `<Space direction="vertical" align="start">
  <Text size="sm">小号文本</Text>
  <Text size="base">中号文本</Text>
  <Text size="lg">大号文本</Text>
</Space>`

const weightSnippet = `<Space direction="vertical" class="w-full">
  <Text weight="normal">Normal</Text>
  <Text weight="semibold">Semibold</Text>
  <Text weight="bold">Bold</Text>
</Space>`

const alignSnippet = `<div class="grid grid-cols-1 gap-4">
  <div class="p-4 bg-white rounded">
    <Text align="left">Left aligned text</Text>
  </div>
  <div class="p-4 bg-white rounded">
    <Text align="center">Center aligned text</Text>
  </div>
  <div class="p-4 bg-white rounded">
    <Text align="right">Right aligned text</Text>
  </div>
  <div class="p-4 bg-white rounded">
    <Text align="justify">Justify aligned — 两端对齐模式下，较长的文本内容会均匀分布在行内，呈现整齐的段落效果。</Text>
  </div>
</div>`

const decorateSnippet = `<Space direction="vertical" class="w-full">
  <div class="w-64">
    <Text truncate> 这是一段很长很长的文本，会在容器宽度不足时显示省略号。 </Text>
  </div>
  <Text italic>这是一段斜体文本。</Text>
  <Text underline>这是一段带下划线的文本。</Text>
  <Text lineThrough>这是一段带删除线的文本。</Text>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Text 文本</h1>
      <p class="text-gray-600">文本的基本格式。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法" description="基础的 Text 用法。" :code="basicSnippet">
      <Space direction="vertical" class="w-full">
        <Text>这是一段默认段落文本。</Text>
        <Text tag="span" class="block">这是一段 span 文本（通过 class 设置为 block）。</Text>
        <Text tag="div">这是一段 div 文本。</Text>
      </Space>
    </DemoBlock>

    <!-- 语义标签 -->
    <DemoBlock title="语义标签" description="通过 tag 属性渲染不同语义标签。" :code="tagSnippet">
      <Space direction="vertical" class="w-full">
        <Text tag="h3" size="lg" weight="semibold">Heading (h3)</Text>
        <Text tag="label" size="sm" color="muted">Label text</Text>
        <Text tag="p">Paragraph text</Text>
      </Space>
    </DemoBlock>

    <!-- 文本颜色 -->
    <DemoBlock title="文本颜色" description="由 color 属性定义文本颜色。" :code="colorSnippet">
      <Space direction="vertical">
        <Text color="primary">主要文本 Primary</Text>
        <Text color="secondary">次要文本 Secondary</Text>
        <Text color="success">成功文本 Success</Text>
        <Text color="warning">警告文本 Warning</Text>
        <Text color="danger">危险文本 Danger</Text>
        <Text color="muted">弱化文本 Muted</Text>
        <Text>默认文本 Default</Text>
      </Space>
    </DemoBlock>

    <!-- 文本大小 -->
    <DemoBlock title="文本大小" description="由 size 属性定义文本大小。" :code="sizeSnippet">
      <Space direction="vertical" align="start">
        <Text size="sm">小号文本</Text>
        <Text size="base">中号文本</Text>
        <Text size="lg">大号文本</Text>
      </Space>
    </DemoBlock>

    <!-- 文本粗细 -->
    <DemoBlock title="文本粗细" description="由 weight 属性定义字重。" :code="weightSnippet">
      <Space direction="vertical" class="w-full">
        <Text weight="normal">Normal</Text>
        <Text weight="semibold">Semibold</Text>
        <Text weight="bold">Bold</Text>
      </Space>
    </DemoBlock>

    <!-- 文本对齐 -->
    <DemoBlock title="文本对齐" description="由 align 属性定义对齐方式。" :code="alignSnippet">
      <div class="grid grid-cols-1 gap-4">
        <div class="p-4 bg-white rounded">
          <Text align="left">Left aligned text</Text>
        </div>
        <div class="p-4 bg-white rounded">
          <Text align="center">Center aligned text</Text>
        </div>
        <div class="p-4 bg-white rounded">
          <Text align="right">Right aligned text</Text>
        </div>
        <div class="p-4 bg-white rounded">
          <Text align="justify">Justify aligned — 两端对齐模式下，较长的文本内容会均匀分布在行内，呈现整齐的段落效果。</Text>
        </div>
      </div>
    </DemoBlock>

    <!-- 文本修饰 -->
    <DemoBlock title="文本修饰" description="truncate / italic / underline / lineThrough。" :code="decorateSnippet">
      <Space direction="vertical" class="w-full">
        <div class="w-64">
          <Text truncate> 这是一段很长很长的文本，会在容器宽度不足时显示省略号。 </Text>
        </div>
        <Text italic>这是一段斜体文本。</Text>
        <Text underline>这是一段带下划线的文本。</Text>
        <Text lineThrough>这是一段带删除线的文本。</Text>
      </Space>
    </DemoBlock>
  </div>
</template>
