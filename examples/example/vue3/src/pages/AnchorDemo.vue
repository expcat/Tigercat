<script setup lang="ts">
import { ref } from 'vue'
import { Anchor, AnchorLink } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

// Get the main scroll container from the layout
const getMainContainer = () => {
  // The layout uses a scrollable div inside main
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return scrollContainer as HTMLElement || window
}

const basicSnippet = `<Anchor>
  <AnchorLink href="#section1" title="Section 1" />
  <AnchorLink href="#section2" title="Section 2" />
  <AnchorLink href="#section3" title="Section 3" />
</Anchor>`

const horizontalSnippet = `<Anchor direction="horizontal">
  <AnchorLink href="#intro" title="介绍" />
  <AnchorLink href="#usage" title="使用方法" />
  <AnchorLink href="#api" title="API" />
</Anchor>`

const nestedSnippet = `<Anchor>
  <AnchorLink href="#chapter1" title="第一章">
    <AnchorLink href="#section1-1" title="1.1 小节" />
    <AnchorLink href="#section1-2" title="1.2 小节" />
  </AnchorLink>
  <AnchorLink href="#chapter2" title="第二章" />
</Anchor>`

const targetSnippet = `<div ref="scrollContainerRef" class="scroll-container">
  <div id="target-section1">...</div>
  <div id="target-section2">...</div>
</div>
<Anchor :getContainer="getScrollContainer">
  <AnchorLink href="#target-section1" title="Section 1" />
  <AnchorLink href="#target-section2" title="Section 2" />
</Anchor>`

const scrollContainerRef = ref<HTMLElement>()
const getScrollContainer = () => {
  // Use getElementById to always get fresh DOM reference (handles HMR)
  return document.getElementById('custom-scroll-container') || window
}

const handleChange = (href: string) => {
  console.log('Anchor changed:', href)
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Anchor 锚点</h1>
      <p class="text-gray-600">用于跳转到页面指定位置的导航组件。</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 左侧内容区 -->
      <div class="lg:col-span-3 space-y-8">
        <div id="demo-basic">
          <DemoBlock title="基本用法"
                     description="最简单的锚点导航。"
                     :code="basicSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
              <p class="text-gray-600">
                点击右侧的锚点链接可以滚动到对应的内容区域。当前选中的锚点会高亮显示。
              </p>
            </div>
          </DemoBlock>
        </div>

        <div id="demo-horizontal">
          <DemoBlock title="水平方向"
                     description="锚点可以水平排列。"
                     :code="horizontalSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
              <Anchor direction="horizontal"
                      @change="handleChange">
                <AnchorLink href="#horizontal-intro"
                            title="介绍" />
                <AnchorLink href="#horizontal-usage"
                            title="使用方法" />
                <AnchorLink href="#horizontal-api"
                            title="API 文档" />
                <AnchorLink href="#horizontal-faq"
                            title="常见问题" />
              </Anchor>
              <p class="mt-4 text-sm text-gray-500">
                水平锚点适合用于文章顶部的快速导航。
              </p>
            </div>
          </DemoBlock>
        </div>

        <div id="demo-container">
          <DemoBlock title="自定义容器"
                     description="可以指定滚动容器。"
                     :code="targetSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
              <div class="flex gap-4">
                <div id="custom-scroll-container"
                     ref="scrollContainerRef"
                     class="flex-1 h-64 overflow-auto border border-gray-200 rounded-lg bg-white">
                  <div id="target-section1"
                       class="p-4 h-48 bg-blue-50">
                    <h3 class="font-semibold text-blue-700">Section 1</h3>
                    <p class="text-gray-600 mt-2">这是 Section 1 的内容区域。</p>
                  </div>
                  <div id="target-section2"
                       class="p-4 h-48 bg-green-50">
                    <h3 class="font-semibold text-green-700">Section 2</h3>
                    <p class="text-gray-600 mt-2">这是 Section 2 的内容区域。</p>
                  </div>
                  <div id="target-section3"
                       class="p-4 h-48 bg-purple-50">
                    <h3 class="font-semibold text-purple-700">Section 3</h3>
                    <p class="text-gray-600 mt-2">这是 Section 3 的内容区域。</p>
                  </div>
                  <div id="target-section4"
                       class="p-4 h-48 bg-orange-50">
                    <h3 class="font-semibold text-orange-700">Section 4</h3>
                    <p class="text-gray-600 mt-2">这是 Section 4 的内容区域。</p>
                  </div>
                </div>
                <div class="w-40">
                  <Anchor :getContainer="getScrollContainer">
                    <AnchorLink href="#target-section1"
                                title="Section 1" />
                    <AnchorLink href="#target-section2"
                                title="Section 2" />
                    <AnchorLink href="#target-section3"
                                title="Section 3" />
                    <AnchorLink href="#target-section4"
                                title="Section 4" />
                  </Anchor>
                </div>
              </div>
            </div>
          </DemoBlock>
        </div>

        <div id="demo-nested">
          <DemoBlock title="嵌套锚点"
                     description="支持多级嵌套的锚点。"
                     :code="nestedSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
              <div class="flex gap-8">
                <div class="flex-1">
                  <p class="text-gray-600 mb-4">
                    嵌套锚点可以用于展示文档的层级结构，如章节和小节。
                  </p>
                  <div class="space-y-2 text-sm text-gray-500">
                    <p>• 第一章 - Chapter 1</p>
                    <p class="pl-4">• 1.1 小节 - Section 1.1</p>
                    <p class="pl-4">• 1.2 小节 - Section 1.2</p>
                    <p>• 第二章 - Chapter 2</p>
                    <p class="pl-4">• 2.1 小节 - Section 2.1</p>
                  </div>
                </div>
                <div class="w-48">
                  <Anchor>
                    <AnchorLink href="#chapter1"
                                title="第一章">
                      <AnchorLink href="#section1-1"
                                  title="1.1 介绍" />
                      <AnchorLink href="#section1-2"
                                  title="1.2 安装" />
                    </AnchorLink>
                    <AnchorLink href="#chapter2"
                                title="第二章">
                      <AnchorLink href="#section2-1"
                                  title="2.1 基础用法" />
                    </AnchorLink>
                  </Anchor>
                </div>
              </div>
            </div>
          </DemoBlock>
        </div>
      </div>

      <!-- 右侧固定锚点导航 -->
      <div class="hidden lg:block">
        <div class="sticky top-20">
          <h4 class="text-sm font-semibold text-gray-500 mb-4">页面导航</h4>
          <Anchor :getContainer="getMainContainer"
                  @change="handleChange">
            <AnchorLink href="#demo-basic"
                        title="基本用法" />
            <AnchorLink href="#demo-horizontal"
                        title="水平方向" />
            <AnchorLink href="#demo-container"
                        title="自定义容器" />
            <AnchorLink href="#demo-nested"
                        title="嵌套锚点" />
          </Anchor>
        </div>
      </div>
    </div>
  </div>
</template>
