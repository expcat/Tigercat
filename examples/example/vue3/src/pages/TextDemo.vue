<script setup lang="ts">
import { Text, Space, Divider } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Text 文本</h1>
      <p class="text-gray-600">文本的基本格式。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的 Text 用法。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Text>这是一段默认段落文本。</Text>
          <Text tag="span"
                class="block">这是一段 span 文本（通过 class 设置为 block）。</Text>
          <Text tag="div">这是一段 div 文本。</Text>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 语义标签 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">语义标签</h2>
      <p class="text-gray-600 mb-6">通过 tag 属性渲染不同语义标签。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Text tag="h3"
                size="lg"
                weight="semibold">Heading (h3)</Text>
          <Text tag="label"
                size="sm"
                color="muted">Label text</Text>
          <Text tag="p">Paragraph text</Text>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文本颜色 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文本颜色</h2>
      <p class="text-gray-600 mb-6">由 color 属性定义文本颜色。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <Text color="primary">主要文本 Primary</Text>
          <Text color="secondary">次要文本 Secondary</Text>
          <Text color="success">成功文本 Success</Text>
          <Text color="warning">警告文本 Warning</Text>
          <Text color="danger">危险文本 Danger</Text>
          <Text>默认文本 Default</Text>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文本大小 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文本大小</h2>
      <p class="text-gray-600 mb-6">由 size 属性定义文本大小。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               align="start">
          <Text size="sm">小号文本</Text>
          <Text size="base">中号文本</Text>
          <Text size="lg">大号文本</Text>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文本粗细 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文本粗细</h2>
      <p class="text-gray-600 mb-6">由 weight 属性定义字重。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Text weight="normal">Normal</Text>
          <Text weight="semibold">Semibold</Text>
          <Text weight="bold">Bold</Text>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文本对齐 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文本对齐</h2>
      <p class="text-gray-600 mb-6">由 align 属性定义对齐方式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文本修饰 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文本修饰</h2>
      <p class="text-gray-600 mb-6">truncate / italic / underline / lineThrough。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <div class="w-64">
            <Text truncate>
              这是一段很长很长的文本，会在容器宽度不足时显示省略号。
            </Text>
          </div>
          <Text italic>这是一段斜体文本。</Text>
          <Text underline>这是一段带下划线的文本。</Text>
          <Text lineThrough>这是一段带删除线的文本。</Text>
        </Space>
      </div>
    </section>
  </div>
</template>
