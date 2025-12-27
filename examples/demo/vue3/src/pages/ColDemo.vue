<script setup lang="ts">
import { Row, Col, Space } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Col 列</h1>
      <p class="text-gray-600">栅格系统中的列组件，基于 24 栏布局。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">Col 组件通过 span 属性设置列的宽度（1-24）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <Row>
            <Col :span="24">
              <div class="bg-blue-500 text-white p-4 rounded text-center">span=24</div>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <div class="bg-green-500 text-white p-4 rounded text-center">span=12</div>
            </Col>
            <Col :span="12">
              <div class="bg-green-400 text-white p-4 rounded text-center">span=12</div>
            </Col>
          </Row>
          <Row>
            <Col :span="8">
              <div class="bg-purple-500 text-white p-4 rounded text-center">span=8</div>
            </Col>
            <Col :span="8">
              <div class="bg-purple-400 text-white p-4 rounded text-center">span=8</div>
            </Col>
            <Col :span="8">
              <div class="bg-purple-300 text-white p-4 rounded text-center">span=8</div>
            </Col>
          </Row>
        </Space>
      </div>
    </section>

    <!-- 偏移 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">列偏移</h2>
      <p class="text-gray-600 mb-6">使用 offset 属性设置列的偏移量。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full">
          <Row>
            <Col :span="8">
              <div class="bg-blue-500 text-white p-4 rounded text-center">span=8</div>
            </Col>
            <Col :span="8" :offset="8">
              <div class="bg-blue-500 text-white p-4 rounded text-center">span=8, offset=8</div>
            </Col>
          </Row>
          <Row>
            <Col :span="6" :offset="6">
              <div class="bg-green-500 text-white p-4 rounded text-center">span=6, offset=6</div>
            </Col>
            <Col :span="6" :offset="6">
              <div class="bg-green-500 text-white p-4 rounded text-center">span=6, offset=6</div>
            </Col>
          </Row>
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
