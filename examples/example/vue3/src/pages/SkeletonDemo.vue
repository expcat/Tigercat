<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Skeleton, Space, Divider, Card, Avatar } from '@expcat/tigercat-vue'

// Loading state simulation
const loading = ref(true)
const cardLoading = ref(true)

onMounted(() => {
  // Simulate data loading for basic demo
  setTimeout(() => {
    loading.value = false
  }, 3000)

  // Simulate data loading for card demo
  setTimeout(() => {
    cardLoading.value = false
  }, 3500)
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Skeleton 骨架屏</h1>
      <p class="text-gray-600">用于在内容加载时显示占位符的骨架屏组件，提升用户体验。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的使用方式，默认为文本占位符。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Skeleton />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同变体 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">骨架屏变体</h2>
      <p class="text-gray-600 mb-6">支持文本、头像、图片、按钮和自定义等多种变体。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-6">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">文本 (Text)</h3>
          <Skeleton variant="text" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">头像 (Avatar)</h3>
          <Skeleton variant="avatar" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">图片 (Image)</h3>
          <Skeleton variant="image" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">按钮 (Button)</h3>
          <Skeleton variant="button" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">自定义 (Custom)</h3>
          <Skeleton variant="custom" width="300px" height="150px" />
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 动画效果 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">动画效果</h2>
      <p class="text-gray-600 mb-6">支持脉冲、波浪和无动画三种效果。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="16" class="w-full">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">脉冲 (Pulse) - 默认</h3>
            <Skeleton animation="pulse" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">波浪 (Wave)</h3>
            <Skeleton animation="wave" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">无动画 (None)</h3>
            <Skeleton animation="none" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 多行文本 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多行文本</h2>
      <p class="text-gray-600 mb-6">使用 rows 属性渲染多行文本骨架屏。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="24" class="w-full">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">3 行</h3>
            <Skeleton variant="text" :rows="3" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">5 行</h3>
            <Skeleton variant="text" :rows="5" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 段落模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">段落模式</h2>
      <p class="text-gray-600 mb-6">启用 paragraph 属性让多行文本具有不同的宽度。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="24" class="w-full">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">段落模式</h3>
            <Skeleton variant="text" :rows="4" paragraph />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">普通模式</h3>
            <Skeleton variant="text" :rows="4" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 头像形状 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">头像形状</h2>
      <p class="text-gray-600 mb-6">头像变体支持圆形和方形两种形状。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <div class="text-center">
            <Skeleton variant="avatar" shape="circle" />
            <p class="text-sm text-gray-600 mt-2">圆形</p>
          </div>
          <div class="text-center">
            <Skeleton variant="avatar" shape="square" />
            <p class="text-sm text-gray-600 mt-2">方形</p>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义尺寸</h2>
      <p class="text-gray-600 mb-6">通过 width 和 height 属性自定义骨架屏的尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="16" class="w-full">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">自定义宽度</h3>
            <Skeleton width="200px" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">自定义高度</h3>
            <Skeleton height="50px" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">同时自定义宽高</h3>
            <Skeleton width="300px" height="100px" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 组合使用 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">组合使用</h2>
      <p class="text-gray-600 mb-6">组合多个 Skeleton 组件创建复杂的加载状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" :size="24" class="w-full">
          <!-- 文章预览 -->
          <div class="bg-white p-4 rounded-lg">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">文章预览</h3>
            <div class="flex items-start gap-4">
              <Skeleton variant="avatar" shape="circle" />
              <div class="flex-1">
                <Skeleton variant="text" width="150px" class="mb-2" />
                <Skeleton variant="text" :rows="2" paragraph />
              </div>
            </div>
          </div>

          <!-- 卡片 -->
          <div class="bg-white p-4 rounded-lg">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">图片卡片</h3>
            <Skeleton variant="image" class="mb-4" />
            <Skeleton variant="text" :rows="2" paragraph class="mb-3" />
            <Skeleton variant="button" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 加载状态控制 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">加载状态控制</h2>
      <p class="text-gray-600 mb-6">结合加载状态使用骨架屏（3秒后显示内容）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="bg-white p-6 rounded-lg">
          <div v-if="loading">
            <Skeleton variant="text" width="200px" class="mb-4" />
            <Skeleton variant="text" :rows="3" paragraph />
          </div>
          <div v-else>
            <h3 class="text-xl font-bold mb-4">文章标题</h3>
            <p class="text-gray-700">
              这是加载完成后显示的内容。骨架屏在内容加载时显示，
              提供更好的用户体验，避免页面空白或突然跳动。
            </p>
          </div>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 真实场景示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">真实场景示例</h2>
      <p class="text-gray-600 mb-6">卡片列表加载效果（3.5秒后显示内容）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <template v-if="cardLoading">
            <Card v-for="i in 4" :key="i">
              <div class="flex items-start gap-4">
                <Skeleton variant="avatar" shape="square" />
                <div class="flex-1">
                  <Skeleton variant="text" width="120px" class="mb-2" />
                  <Skeleton variant="text" :rows="2" paragraph />
                </div>
              </div>
            </Card>
          </template>
          <template v-else>
            <Card v-for="i in 4" :key="i">
              <div class="flex items-start gap-4">
                <Avatar shape="square" text="Item" />
                <div class="flex-1">
                  <h4 class="font-semibold mb-1">Item {{ i }}</h4>
                  <p class="text-sm text-gray-600">
                    This is the content loaded after the skeleton.
                  </p>
                </div>
              </div>
            </Card>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
