<script setup lang="ts">
import { ref } from 'vue'
import { Loading, Button, Card, Divider } from '@expcat/tigercat-vue'

const pageLoading = ref(false)
const cardLoading = ref(false)
const buttonLoading = ref(false)

const showPageLoading = () => {
  pageLoading.value = true
  setTimeout(() => {
    pageLoading.value = false
  }, 2000)
}

const refreshCard = () => {
  cardLoading.value = true
  setTimeout(() => {
    cardLoading.value = false
  }, 1500)
}

const handleSubmit = () => {
  buttonLoading.value = true
  setTimeout(() => {
    buttonLoading.value = false
  }, 2000)
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Loading 加载中</h1>
      <p class="text-gray-600">
        用于展示加载状态，支持多种加载动画样式，可用于页面和区块的加载状态。
      </p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，显示加载动画。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex gap-8 items-center justify-center">
          <Loading />
          <Loading text="加载中..." />
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 加载动画变体 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">加载动画变体</h2>
      <p class="text-gray-600 mb-6">Loading 组件支持 5 种不同的动画样式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-5 gap-8">
          <div class="flex flex-col items-center gap-2">
            <Loading variant="spinner" />
            <span class="text-sm text-gray-600">Spinner</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading variant="ring" />
            <span class="text-sm text-gray-600">Ring</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading variant="dots" />
            <span class="text-sm text-gray-600">Dots</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading variant="bars" />
            <span class="text-sm text-gray-600">Bars</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading variant="pulse" />
            <span class="text-sm text-gray-600">Pulse</span>
          </div>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 尺寸大小 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">尺寸大小</h2>
      <p class="text-gray-600 mb-6">Loading 组件支持 4 种不同的尺寸：sm、md（默认）、lg、xl。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex gap-8 items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <Loading size="sm" />
            <span class="text-sm text-gray-600">Small</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading size="md" />
            <span class="text-sm text-gray-600">Medium</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading size="lg" />
            <span class="text-sm text-gray-600">Large</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading size="xl" />
            <span class="text-sm text-gray-600">Extra Large</span>
          </div>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 颜色变体 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">颜色变体</h2>
      <p class="text-gray-600 mb-6">Loading 组件支持 7 种颜色变体，也可以自定义颜色。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-4 gap-6">
          <div class="flex flex-col items-center gap-2">
            <Loading color="primary" />
            <span class="text-sm text-gray-600">Primary</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading color="secondary" />
            <span class="text-sm text-gray-600">Secondary</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading color="success" />
            <span class="text-sm text-gray-600">Success</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading color="warning" />
            <span class="text-sm text-gray-600">Warning</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading color="danger" />
            <span class="text-sm text-gray-600">Danger</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading color="info" />
            <span class="text-sm text-gray-600">Info</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading color="default" />
            <span class="text-sm text-gray-600">Default</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading custom-color="#ff6b6b" />
            <span class="text-sm text-gray-600">Custom</span>
          </div>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 全屏加载 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">全屏加载</h2>
      <p class="text-gray-600 mb-6">使用 fullscreen 属性可以创建全屏加载遮罩层。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="showPageLoading">显示全屏加载</Button>
        <Loading v-if="pageLoading" fullscreen text="页面加载中..." />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 卡片加载 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">区域加载</h2>
      <p class="text-gray-600 mb-6">在某个区域内显示加载状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Card title="数据统计">
          <div class="relative min-h-[200px]">
            <div
              v-if="cardLoading"
              class="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loading text="刷新中..." />
            </div>
            <div v-else>
              <p class="mb-2">总用户数: 1,234</p>
              <p class="mb-2">活跃用户: 567</p>
              <p class="mb-4">新增用户: 89</p>
              <Button @click="refreshCard">刷新数据</Button>
            </div>
          </div>
        </Card>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 按钮加载 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">按钮加载</h2>
      <p class="text-gray-600 mb-6">与按钮组合使用，展示操作进行中的状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex gap-4">
          <Button :loading="buttonLoading" @click="handleSubmit"> 提交 </Button>
          <Button variant="secondary" :loading="buttonLoading" @click="handleSubmit"> 保存 </Button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 延迟显示 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">延迟显示</h2>
      <p class="text-gray-600 mb-6">使用 delay 属性可以延迟显示加载器，避免闪烁（延迟 300ms）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex gap-8 items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <Loading :delay="0" text="无延迟" />
          </div>
          <div class="flex flex-col items-center gap-2">
            <Loading :delay="300" text="延迟 300ms" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
