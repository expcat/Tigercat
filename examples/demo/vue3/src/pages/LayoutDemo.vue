<script setup lang="ts">
import { Container, Layout, Header, Sidebar, Content, Footer } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Layout 布局</h1>
      <p class="text-gray-600">协助进行页面级整体布局。</p>
    </div>

    <!-- Container 容器 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">Container 容器</h2>
      <p class="text-gray-600 mb-6">用于约束内容宽度并提供响应式内边距。</p>
      <div class="bg-gray-50 rounded-lg py-6">
        <Container maxWidth="lg">
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="font-medium mb-1">这里是 Container 内容区域</div>
            <div class="text-sm text-gray-600">maxWidth=&quot;lg&quot;，默认居中并带有响应式 padding</div>
          </div>
        </Container>
      </div>
    </section>

    <!-- 基础布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础布局</h2>
      <p class="text-gray-600 mb-6">典型的页面布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </section>

    <!-- 侧边栏布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">侧边栏布局</h2>
      <p class="text-gray-600 mb-6">带有侧边栏的布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px"
                     class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
            <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </section>

    <!-- 复杂布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">复杂布局</h2>
      <p class="text-gray-600 mb-6">更复杂的页面布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[400px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px"
                     class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
            <Layout class-name="min-h-0 flex-1">
              <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
              <Footer class-name="!bg-gray-100 !p-4">Inner Footer</Footer>
            </Layout>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/"
                   class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
