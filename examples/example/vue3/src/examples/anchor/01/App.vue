<script setup lang="ts">
import { AnchorLink } from '@expcat/tigercat-vue/AnchorLink'
import { ref } from 'vue'
import { Anchor } from '@expcat/tigercat-vue/Anchor'

// Get the main scroll container from the layout
const getMainContainer = () => {
  // The layout uses a scrollable div inside main
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return (scrollContainer as HTMLElement) || window
}

const getScrollContainer = () => {
  // Use getElementById to always get fresh DOM reference (handles HMR)
  return document.getElementById('custom-scroll-container') || window
}

const handleChange = (href: string) => {
  console.log('Anchor changed:', href)
}

const lastEvent = ref('')
const handleDemoClick = (_e: MouseEvent, href: string) => {
  lastEvent.value = `点击: ${href}`
}
const handleDemoChange = (activeLink: string) => {
  lastEvent.value = `激活: ${activeLink}`
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <p class="text-gray-600 dark:text-gray-400">
            点击右侧的锚点链接可以滚动到对应的内容区域。当前选中的锚点会高亮显示。
          </p>
        </div>
      </div>
      <div class="space-y-3">
        <h3
          id="demo-horizontal"
          class="text-sm font-semibold text-gray-700 dark:text-gray-200 scroll-mt-20">
          水平方向
        </h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Anchor direction="horizontal" :getContainer="getMainContainer" @change="handleChange">
            <AnchorLink href="#demo-basic" title="基本用法" />
            <AnchorLink href="#demo-horizontal" title="水平方向" />
            <AnchorLink href="#demo-container" title="自定义容器" />
            <AnchorLink href="#demo-nested" title="嵌套锚点" />
          </Anchor>
          <p class="mt-4 text-sm text-gray-500">水平锚点适合用于页面顶部的快速导航。</p>
        </div>
      </div>
    </div>
  </div>
</template>
