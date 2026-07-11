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
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">嵌套锚点</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex gap-8">
            <div class="flex-1">
              <p class="text-gray-600 mb-4">嵌套锚点可以用于展示文档的层级结构，如章节和小节。</p>
              <div class="space-y-2 text-sm text-gray-500">
                <p id="chapter1" class="scroll-mt-20">• 第一章 - Chapter 1</p>
                <p id="section1-1" class="pl-4 scroll-mt-20">• 1.1 小节 - Section 1.1</p>
                <p id="section1-2" class="pl-4 scroll-mt-20">• 1.2 小节 - Section 1.2</p>
                <p id="chapter2" class="scroll-mt-20">• 第二章 - Chapter 2</p>
                <p id="section2-1" class="pl-4 scroll-mt-20">• 2.1 小节 - Section 2.1</p>
              </div>
            </div>
            <div class="w-48">
              <Anchor>
                <AnchorLink href="#chapter1" title="第一章">
                  <AnchorLink href="#section1-1" title="1.1 介绍" />
                  <AnchorLink href="#section1-2" title="1.2 安装" />
                </AnchorLink>
                <AnchorLink href="#chapter2" title="第二章">
                  <AnchorLink href="#section2-1" title="2.1 基础用法" />
                </AnchorLink>
              </Anchor>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3
          id="demo-ink"
          class="text-sm font-semibold text-gray-700 dark:text-gray-200 scroll-mt-20">
          墨水指示器
        </h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex gap-8">
            <div class="flex-1">
              <p class="text-gray-600 mb-2"><code>affix=false</code> 时墨水指示器默认显示：</p>
              <Anchor :affix="false" :getContainer="getMainContainer">
                <AnchorLink href="#demo-basic" title="基本用法" />
                <AnchorLink href="#demo-horizontal" title="水平方向" />
              </Anchor>
            </div>
            <div class="flex-1">
              <p class="text-gray-600 mb-2"><code>showInkInFixed</code> 在固定模式下也显示：</p>
              <Anchor :show-ink-in-fixed="true" :getContainer="getMainContainer">
                <AnchorLink href="#demo-container" title="自定义容器" />
                <AnchorLink href="#demo-nested" title="嵌套锚点" />
              </Anchor>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
