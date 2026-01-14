<script setup lang="ts">
import { Button, Space, Divider } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Button 按钮</h1>
      <p class="text-gray-600">按钮用于触发一个操作。</p>
    </div>

    <!-- 按钮类型 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">按钮类型</h2>
      <p class="text-gray-600 mb-6">
        按钮有五种类型：主要按钮、次要按钮、轮廓按钮、幽灵按钮和链接按钮。
      </p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Button variant="primary">主要按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="link">链接按钮</Button>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 按钮大小 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">按钮大小</h2>
      <p class="text-gray-600 mb-6">按钮有三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space align="center">
          <Button size="sm">小按钮</Button>
          <Button size="md">中按钮</Button>
          <Button size="lg">大按钮</Button>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 按钮状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">按钮状态</h2>
      <p class="text-gray-600 mb-6">按钮可以处于正常、禁用或加载状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <div>
            <h3 class="text-sm font-semibold mb-2 text-gray-700">正常状态</h3>
            <Space>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </Space>
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2 text-gray-700">禁用状态</h3>
            <Space>
              <Button variant="primary" disabled>主要按钮</Button>
              <Button variant="secondary" disabled>次要按钮</Button>
              <Button variant="outline" disabled>轮廓按钮</Button>
            </Space>
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2 text-gray-700">加载状态</h3>
            <Space>
              <Button variant="primary" loading>主要按钮</Button>
              <Button variant="secondary" loading>次要按钮</Button>
              <Button variant="outline" loading>轮廓按钮</Button>
            </Space>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 块级按钮 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">块级按钮</h2>
      <p class="text-gray-600 mb-6">block 属性将使按钮适合其父宽度。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <Button variant="primary" block>主要按钮</Button>
          <Button variant="secondary" block>次要按钮</Button>
          <Button variant="outline" block>轮廓按钮</Button>
        </Space>
      </div>
    </section>

    <!-- 全宽按钮 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">全宽按钮</h2>
      <p class="text-gray-600 mb-6">使用 class 设置按钮宽度。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <Button variant="primary" class="w-full">主要按钮</Button>
          <Button variant="secondary" class="w-full">次要按钮</Button>
          <Button variant="outline" class="w-full">轮廓按钮</Button>
        </Space>
      </div>
    </section>
  </div>
</template>
