<script setup lang="ts">
import { Row, Col, Container, Space } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Grid 栅格</h1>
      <p class="text-gray-600">通过基础的 24 分栏，迅速简便地创建布局。</p>
    </div>

    <!-- 基础栅格 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础栅格</h2>
      <p class="text-gray-600 mb-6">使用单一分栏创建基础的栅格布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical" class="w-full">
            <Row>
              <Col :span="24">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-24</div>
              </Col>
            </Row>
            <Row>
              <Col :span="12">
                <div class="bg-blue-600 text-white p-4 rounded text-center">col-12</div>
              </Col>
              <Col :span="12">
                <div class="bg-blue-400 text-white p-4 rounded text-center">col-12</div>
              </Col>
            </Row>
            <Row>
              <Col :span="8">
                <div class="bg-green-600 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col :span="8">
                <div class="bg-green-400 text-white p-4 rounded text-center">col-8</div>
              </Col>
            </Row>
            <Row>
              <Col :span="6">
                <div class="bg-purple-600 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-purple-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-purple-400 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-purple-300 text-white p-4 rounded text-center">col-6</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </section>

    <!-- 分栏间隔 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">分栏间隔</h2>
      <p class="text-gray-600 mb-6">分栏之间存在间隔。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical" class="w-full">
            <Row :gutter="16">
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </section>

    <!-- 混合布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">混合布局</h2>
      <p class="text-gray-600 mb-6">通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical" class="w-full">
            <Row :gutter="16">
              <Col :span="16">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-16</div>
              </Col>
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
            </Row>
            <Row :gutter="16">
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col :span="4">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-4</div>
              </Col>
              <Col :span="4">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-4</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
