<script setup lang="ts">
import { Link, Space, Divider } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Link 链接</h1>
      <p class="text-gray-600">文字超链接。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的链接用法。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="https://github.com">默认链接</Link>
          <Link href="https://github.com" color="primary">主要链接</Link>
          <Link href="https://github.com" color="success">成功链接</Link>
          <Link href="https://github.com" color="warning">警告链接</Link>
          <Link href="https://github.com" color="danger">危险链接</Link>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">链接不可用状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="#" disabled>禁用链接</Link>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 下划线 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">下划线</h2>
      <p class="text-gray-600 mb-6">链接下划线。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="#" underline>有下划线</Link>
          <Link href="#">无下划线（默认）</Link>
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
