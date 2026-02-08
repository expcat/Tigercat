<script setup lang="ts">
import { h } from 'vue'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products">产品</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const arrowSnippet = `<Breadcrumb separator="arrow">
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products">产品</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const chevronSnippet = `<Breadcrumb separator="chevron">
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products">产品</BreadcrumbItem>
  <BreadcrumbItem href="/category">分类</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const customSnippet = `<Breadcrumb separator=">">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
  <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
</Breadcrumb>`

const iconSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/" :icon="homeIcon">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products" :icon="bagIcon">产品</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const externalSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem href="https://github.com" target="_blank">GitHub</BreadcrumbItem>
  <BreadcrumbItem current>当前页面</BreadcrumbItem>
</Breadcrumb>`

const clickSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/" @click="handleClick">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products" @click="handleClick">产品</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const multiSnippet = `<Breadcrumb separator="chevron">
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem href="/category">分类</BreadcrumbItem>
  <BreadcrumbItem href="/category/electronics">电子产品</BreadcrumbItem>
  <BreadcrumbItem href="/category/electronics/phones">手机</BreadcrumbItem>
  <BreadcrumbItem href="/category/electronics/phones/smartphones">智能手机</BreadcrumbItem>
  <BreadcrumbItem current>iPhone 15 Pro</BreadcrumbItem>
</Breadcrumb>`

const itemSeparatorSnippet = `<Breadcrumb>
  <BreadcrumbItem href="/" separator="arrow">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products" separator="chevron">产品</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const extraSnippet = `<Breadcrumb>
  <template #extra>
    <button class="text-sm text-blue-600 hover:underline">编辑</button>
  </template>
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem href="/products">产品</BreadcrumbItem>
  <BreadcrumbItem current>详情</BreadcrumbItem>
</Breadcrumb>`

const homeIcon = h('svg', { class: 'w-4 h-4', fill: 'currentColor', viewBox: '0 0 20 20' }, [
  h('path', {
    d: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z'
  })
])

const bagIcon = h('svg', { class: 'w-4 h-4', fill: 'currentColor', viewBox: '0 0 20 20' }, [
  h('path', {
    'fill-rule': 'evenodd',
    d: 'M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z',
    'clip-rule': 'evenodd'
  })
])

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

    <DemoBlock title="基本用法"
               description="最简单的面包屑导航。"
               :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="箭头分隔符"
               description="使用箭头作为分隔符。"
               :code="arrowSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator="arrow">
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="尖括号分隔符"
               description="使用尖括号作为分隔符。"
               :code="chevronSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator="chevron">
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem href="/category">分类</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义分隔符"
               description="可以使用任意字符串作为分隔符。"
               :code="customSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb separator=">">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
          <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="带图标"
               description="可以在面包屑项中添加图标。"
               :code="iconSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/"
                          :icon="homeIcon">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products"
                          :icon="bagIcon">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="外部链接"
               description="支持在新窗口打开链接。"
               :code="externalSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="https://github.com"
                          target="_blank"> GitHub </BreadcrumbItem>
          <BreadcrumbItem current>当前页面</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="点击事件"
               description="面包屑项可以监听点击事件（查看控制台）。"
               :code="clickSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/"
                          @click="handleClick">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products"
                          @click="handleClick">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="多级层次"
               description="支持任意层级的面包屑导航。"
               :code="multiSnippet">
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
    </DemoBlock>

    <DemoBlock title="单独设置分隔符"
               description="每个面包屑项可以单独设置分隔符。"
               :code="itemSeparatorSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <BreadcrumbItem href="/"
                          separator="arrow">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products"
                          separator="chevron">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>

    <DemoBlock title="扩展区域"
               description="通过 extra 插槽在面包屑末尾添加操作按钮等扩展内容。"
               :code="extraSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Breadcrumb>
          <template #extra>
            <button class="text-sm text-blue-600 hover:underline">编辑</button>
          </template>
          <BreadcrumbItem href="/">首页</BreadcrumbItem>
          <BreadcrumbItem href="/products">产品</BreadcrumbItem>
          <BreadcrumbItem current>详情</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </DemoBlock>
  </div>
</template>
