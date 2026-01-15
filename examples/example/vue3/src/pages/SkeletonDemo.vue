<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Skeleton, Space, Card, Avatar } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

const basicSnippet = `<Skeleton />`

const variantsSnippet = `<div class="space-y-6">
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
</div>`

const animationSnippet = `<Space direction="vertical" :size="16" class="w-full">
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
</Space>`

const rowsSnippet = `<Space direction="vertical" :size="24" class="w-full">
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-2">3 行</h3>
    <Skeleton variant="text" :rows="3" />
  </div>
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-2">5 行</h3>
    <Skeleton variant="text" :rows="5" />
  </div>
</Space>`

const paragraphSnippet = `<Space direction="vertical" :size="24" class="w-full">
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-2">段落模式</h3>
    <Skeleton variant="text" :rows="4" paragraph />
  </div>
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-2">普通模式</h3>
    <Skeleton variant="text" :rows="4" />
  </div>
</Space>`

const avatarShapeSnippet = `<Space>
  <div class="text-center">
    <Skeleton variant="avatar" shape="circle" />
    <p class="text-sm text-gray-600 mt-2">圆形</p>
  </div>
  <div class="text-center">
    <Skeleton variant="avatar" shape="square" />
    <p class="text-sm text-gray-600 mt-2">方形</p>
  </div>
</Space>`

const sizeSnippet = `<Space direction="vertical" :size="16" class="w-full">
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
</Space>`

const composeSnippet = `<Space direction="vertical" :size="24" class="w-full">
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

  <div class="bg-white p-4 rounded-lg">
    <h3 class="text-sm font-semibold text-gray-700 mb-4">图片卡片</h3>
    <Skeleton variant="image" class="mb-4" />
    <Skeleton variant="text" :rows="2" paragraph class="mb-3" />
    <Skeleton variant="button" />
  </div>
</Space>`

const loadingSnippet = `<div class="bg-white p-6 rounded-lg">
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
</div>`

const realSnippet = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <p class="text-sm text-gray-600">This is the content loaded after the skeleton.</p>
        </div>
      </div>
    </Card>
  </template>
</div>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Skeleton 骨架屏</h1>
      <p class="text-gray-600">用于在内容加载时显示占位符的骨架屏组件，提升用户体验。</p>
    </div>

    <!-- 基本用法 -->
    <DemoBlock title="基本用法"
               description="最简单的使用方式，默认为文本占位符。"
               :code="basicSnippet">
      <Skeleton />
    </DemoBlock>

    <!-- 不同变体 -->
    <DemoBlock title="骨架屏变体"
               description="支持文本、头像、图片、按钮和自定义等多种变体。"
               :code="variantsSnippet">
      <div class="space-y-6">
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
          <Skeleton variant="custom"
                    width="300px"
                    height="150px" />
        </div>
      </div>
    </DemoBlock>

    <!-- 动画效果 -->
    <DemoBlock title="动画效果"
               description="支持脉冲、波浪和无动画三种效果。"
               :code="animationSnippet">
      <Space direction="vertical"
             :size="16"
             class="w-full">
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
    </DemoBlock>

    <!-- 多行文本 -->
    <DemoBlock title="多行文本"
               description="使用 rows 属性渲染多行文本骨架屏。"
               :code="rowsSnippet">
      <Space direction="vertical"
             :size="24"
             class="w-full">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">3 行</h3>
          <Skeleton variant="text"
                    :rows="3" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">5 行</h3>
          <Skeleton variant="text"
                    :rows="5" />
        </div>
      </Space>
    </DemoBlock>

    <!-- 段落模式 -->
    <DemoBlock title="段落模式"
               description="启用 paragraph 属性让多行文本具有不同的宽度。"
               :code="paragraphSnippet">
      <Space direction="vertical"
             :size="24"
             class="w-full">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">段落模式</h3>
          <Skeleton variant="text"
                    :rows="4"
                    paragraph />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">普通模式</h3>
          <Skeleton variant="text"
                    :rows="4" />
        </div>
      </Space>
    </DemoBlock>

    <!-- 头像形状 -->
    <DemoBlock title="头像形状"
               description="头像变体支持圆形和方形两种形状。"
               :code="avatarShapeSnippet">
      <Space>
        <div class="text-center">
          <Skeleton variant="avatar"
                    shape="circle" />
          <p class="text-sm text-gray-600 mt-2">圆形</p>
        </div>
        <div class="text-center">
          <Skeleton variant="avatar"
                    shape="square" />
          <p class="text-sm text-gray-600 mt-2">方形</p>
        </div>
      </Space>
    </DemoBlock>

    <!-- 自定义尺寸 -->
    <DemoBlock title="自定义尺寸"
               description="通过 width 和 height 属性自定义骨架屏的尺寸。"
               :code="sizeSnippet">
      <Space direction="vertical"
             :size="16"
             class="w-full">
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
          <Skeleton width="300px"
                    height="100px" />
        </div>
      </Space>
    </DemoBlock>

    <!-- 组合使用 -->
    <DemoBlock title="组合使用"
               description="组合多个 Skeleton 组件创建复杂的加载状态。"
               :code="composeSnippet">
      <Space direction="vertical"
             :size="24"
             class="w-full">
        <div class="bg-white p-4 rounded-lg">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">文章预览</h3>
          <div class="flex items-start gap-4">
            <Skeleton variant="avatar"
                      shape="circle" />
            <div class="flex-1">
              <Skeleton variant="text"
                        width="150px"
                        class="mb-2" />
              <Skeleton variant="text"
                        :rows="2"
                        paragraph />
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">图片卡片</h3>
          <Skeleton variant="image"
                    class="mb-4" />
          <Skeleton variant="text"
                    :rows="2"
                    paragraph
                    class="mb-3" />
          <Skeleton variant="button" />
        </div>
      </Space>
    </DemoBlock>

    <!-- 加载状态控制 -->
    <DemoBlock title="加载状态控制"
               description="结合加载状态使用骨架屏（3秒后显示内容）。"
               :code="loadingSnippet">
      <div class="bg-white p-6 rounded-lg">
        <div v-if="loading">
          <Skeleton variant="text"
                    width="200px"
                    class="mb-4" />
          <Skeleton variant="text"
                    :rows="3"
                    paragraph />
        </div>
        <div v-else>
          <h3 class="text-xl font-bold mb-4">文章标题</h3>
          <p class="text-gray-700">
            这是加载完成后显示的内容。骨架屏在内容加载时显示，
            提供更好的用户体验，避免页面空白或突然跳动。
          </p>
        </div>
      </div>
    </DemoBlock>

    <!-- 真实场景示例 -->
    <DemoBlock title="真实场景示例"
               description="卡片列表加载效果（3.5秒后显示内容）。"
               :code="realSnippet">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-if="cardLoading">
          <Card v-for="i in 4"
                :key="i">
            <div class="flex items-start gap-4">
              <Skeleton variant="avatar"
                        shape="square" />
              <div class="flex-1">
                <Skeleton variant="text"
                          width="120px"
                          class="mb-2" />
                <Skeleton variant="text"
                          :rows="2"
                          paragraph />
              </div>
            </div>
          </Card>
        </template>
        <template v-else>
          <Card v-for="i in 4"
                :key="i">
            <div class="flex items-start gap-4">
              <Avatar shape="square"
                      text="Item" />
              <div class="flex-1">
                <h4 class="font-semibold mb-1">Item {{ i }}</h4>
                <p class="text-sm text-gray-600">This is the content loaded after the skeleton.</p>
              </div>
            </div>
          </Card>
        </template>
      </div>
    </DemoBlock>
  </div>
</template>
