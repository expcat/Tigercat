<script setup lang="ts">
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
import { h } from 'vue'
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'

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
  <div class="min-w-0">
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
  </div>
</template>
