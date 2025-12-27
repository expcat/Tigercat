<script setup lang="ts">
import { Text, Space, Divider } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Text 文本</h1>
      <p class="text-gray-600">文本的基本格式。</p>
    </div>

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
        <Space direction="vertical" align="start">
          <Text size="sm">小号文本</Text>
          <Text size="base">中号文本</Text>
          <Text size="lg">大号文本</Text>
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
