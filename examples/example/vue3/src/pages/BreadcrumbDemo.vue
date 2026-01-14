<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem, Divider } from '@tigercat/vue'

const handleClick = (event: MouseEvent) => {
  console.log('Breadcrumb item clicked:', event)
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Breadcrumb 面包屑</h1>
      <p class="text-gray-600">显示当前页面在系统层级结构中的位置，并能向上返回。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的面包屑导航。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 箭头分隔符 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">箭头分隔符</h2>
      <p class="text-gray-600 mb-6">使用箭头作为分隔符。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator="arrow">
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 尖括号分隔符 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">尖括号分隔符</h2>
      <p class="text-gray-600 mb-6">使用尖括号作为分隔符。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator="chevron">
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem href="/category">分类</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义分隔符 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义分隔符</h2>
      <p class="text-gray-600 mb-6">可以使用任意字符串作为分隔符。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator=">">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
          <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带图标 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带图标</h2>
      <p class="text-gray-600 mb-6">可以在面包屑项中添加图标。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/">
            <span class="inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              首页
            </span>
          </BreadcrumbItem>
          <BreadcrumbItem href="/products">
            <span class="inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clip-rule="evenodd" />
              </svg>
              产品
            </span>
          </BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 外部链接 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">外部链接</h2>
      <p class="text-gray-600 mb-6">支持在新窗口打开链接。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="https://github.com" target="_blank"> GitHub </BreadcrumbItem>
          <BreadcrumbItem current>当前页面</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 点击事件 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">点击事件</h2>
      <p class="text-gray-600 mb-6">面包屑项可以监听点击事件（查看控制台）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/" @click="handleClick">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products" @click="handleClick">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 多级层次 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多级层次</h2>
      <p class="text-gray-600 mb-6">支持任意层级的面包屑导航。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator="chevron">
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/category">分类</BreadcrumbItem>
          <BreadcrumbItem href="/category/electronics">电子产品</BreadcrumbItem>
          <BreadcrumbItem href="/category/electronics/phones">手机</BreadcrumbItem>
          <BreadcrumbItem href="/category/electronics/phones/smartphones">智能手机</BreadcrumbItem>
          <BreadcrumbItem current>iPhone 15 Pro</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 单独设置分隔符 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">单独设置分隔符</h2>
      <p class="text-gray-600 mb-6">每个面包屑项可以单独设置分隔符。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/" separator="arrow">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products" separator="chevron">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </section>
  </div>
</template>
