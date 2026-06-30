<script setup lang="ts">
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
import { h } from 'vue'
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './BreadcrumbDemo.vue?raw'

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
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Breadcrumb 面包屑</h1>
      <p class="text-gray-600 dark:text-gray-400">
        显示当前页面在系统层级结构中的位置，并能向上返回。
      </p>
    </div>

    <DemoBlock
      title="基本用法等组合展示"
      description="合并展示基本用法、箭头分隔符、尖括号分隔符等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb>
              <BreadcrumbItem href="/">首页</BreadcrumbItem>
              <BreadcrumbItem href="/products">产品</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">箭头分隔符</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb separator="arrow">
              <BreadcrumbItem href="/">首页</BreadcrumbItem>
              <BreadcrumbItem href="/products">产品</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">尖括号分隔符</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb separator="chevron">
              <BreadcrumbItem href="/">首页</BreadcrumbItem>
              <BreadcrumbItem href="/products">产品</BreadcrumbItem>
              <BreadcrumbItem href="/category">分类</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义分隔符</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb separator=">">
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
              <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </DemoBlock>

    <DemoBlock
      title="带图标等组合展示"
      description="合并展示带图标、外部链接、点击事件等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">带图标</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb>
              <BreadcrumbItem href="/" :icon="homeIcon">首页</BreadcrumbItem>
              <BreadcrumbItem href="/products" :icon="bagIcon">产品</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">外部链接</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb>
              <BreadcrumbItem href="/">首页</BreadcrumbItem>
              <BreadcrumbItem href="https://github.com" target="_blank"> GitHub </BreadcrumbItem>
              <BreadcrumbItem current>当前页面</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">点击事件</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb>
              <BreadcrumbItem href="/" @click="handleClick">首页</BreadcrumbItem>
              <BreadcrumbItem href="/products" @click="handleClick">产品</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多级层次</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb separator="chevron">
              <BreadcrumbItem href="/">首页</BreadcrumbItem>
              <BreadcrumbItem href="/category">分类</BreadcrumbItem>
              <BreadcrumbItem href="/category/electronics">电子产品</BreadcrumbItem>
              <BreadcrumbItem href="/category/electronics/phones">手机</BreadcrumbItem>
              <BreadcrumbItem href="/category/electronics/phones/smartphones"
                >智能手机</BreadcrumbItem
              >
              <BreadcrumbItem current>iPhone 15 Pro</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">单独设置分隔符</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Breadcrumb>
              <BreadcrumbItem href="/" separator="arrow">首页</BreadcrumbItem>
              <BreadcrumbItem href="/products" separator="chevron">产品</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">扩展区域</h3>
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
        </div>
      </div>
    </DemoBlock>
  </div>
</template>
