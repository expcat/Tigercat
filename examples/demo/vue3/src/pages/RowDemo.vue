<script setup lang="ts">
import { Row, Col, Space } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Row 行</h1>
      <p class="text-gray-600">栅格系统中的行组件，用于创建水平布局。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">Row 组件通常与 Col 组件配合使用创建栅格布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <Row>
            <Col :span="12">
              <div class="bg-blue-500 text-white p-4 rounded text-center">Col-12</div>
            </Col>
            <Col :span="12">
              <div class="bg-blue-400 text-white p-4 rounded text-center">Col-12</div>
            </Col>
          </Row>
        </Space>
      </div>
    </section>

    <!-- 间距 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">间距</h2>
      <p class="text-gray-600 mb-6">使用 gutter 属性设置列之间的间距。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <div>
            <p class="text-sm text-gray-600 mb-2">gutter: 0 (默认)</p>
            <Row>
              <Col :span="8"><div class="bg-green-500 text-white p-4 rounded text-center">Col-8</div></Col>
              <Col :span="8"><div class="bg-green-500 text-white p-4 rounded text-center">Col-8</div></Col>
              <Col :span="8"><div class="bg-green-500 text-white p-4 rounded text-center">Col-8</div></Col>
            </Row>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">gutter: 16</p>
            <Row :gutter="16">
              <Col :span="8"><div class="bg-purple-500 text-white p-4 rounded text-center">Col-8</div></Col>
              <Col :span="8"><div class="bg-purple-500 text-white p-4 rounded text-center">Col-8</div></Col>
              <Col :span="8"><div class="bg-purple-500 text-white p-4 rounded text-center">Col-8</div></Col>
            </Row>
          </div>
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
      <span class="mx-2 text-gray-400">|</span>
      <router-link to="/grid" class="text-blue-600 hover:text-blue-800">查看 Grid 完整示例</router-link>
    </div>
  </div>
</template>
