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
    <div class="p-6 bg-gray-50 rounded-lg">
      <div class="flex gap-8 items-start">
        <div class="flex-1">
          <Anchor
            :affix="false"
            :getContainer="getMainContainer"
            :target-offset="60"
            @click="handleDemoClick"
            @change="handleDemoChange">
            <AnchorLink href="#demo-basic" title="基本用法" />
            <AnchorLink href="#demo-horizontal" title="水平方向" />
            <AnchorLink href="#demo-container" title="自定义容器" />
          </Anchor>
        </div>
        <div class="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-sm">
          <p class="text-gray-500 mb-1">最近事件：</p>
          <p class="font-mono text-gray-800">{{ lastEvent || '（点击或滚动触发）' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
