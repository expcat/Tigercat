<script setup lang="ts">
import { Layout, Header, Sidebar, Content, Footer } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Layout 布局</h1>
      <p class="text-gray-600">协助进行页面级整体布局。</p>
    </div>

    <!-- 基础布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础布局</h2>
      <p class="text-gray-600 mb-6">典型的页面布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class="border border-gray-300 overflow-hidden">
          <Header class="bg-blue-600 text-white p-4">Header</Header>
          <Content class="bg-white p-4 min-h-[200px]">Content</Content>
          <Footer class="bg-gray-800 text-white p-4">Footer</Footer>
        </Layout>
      </div>
    </section>

    <!-- 侧边栏布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">侧边栏布局</h2>
      <p class="text-gray-600 mb-6">带有侧边栏的布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class="border border-gray-300 overflow-hidden">
          <Header class="bg-blue-600 text-white p-4">Header</Header>
          <Layout>
            <Sidebar class="bg-gray-200 p-4 w-48">Sidebar</Sidebar>
            <Content class="bg-white p-4 min-h-[200px]">Content</Content>
          </Layout>
          <Footer class="bg-gray-800 text-white p-4">Footer</Footer>
        </Layout>
      </div>
    </section>

    <!-- 复杂布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">复杂布局</h2>
      <p class="text-gray-600 mb-6">更复杂的页面布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class="border border-gray-300 overflow-hidden min-h-[400px]">
          <Header class="bg-blue-600 text-white p-4">Header</Header>
          <Layout>
            <Sidebar class="bg-gray-200 p-4 w-48">Sidebar</Sidebar>
            <Layout>
              <Content class="bg-white p-4 min-h-[200px]">Content</Content>
              <Footer class="bg-gray-100 p-4">Inner Footer</Footer>
            </Layout>
          </Layout>
          <Footer class="bg-gray-800 text-white p-4">Footer</Footer>
        </Layout>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
