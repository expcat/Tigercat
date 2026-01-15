<script setup lang="ts">
import { Link, Space, Divider } from '@expcat/tigercat-vue'

const handlePreventNavigate = (event: MouseEvent) => {
  event.preventDefault()
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Link 链接</h1>
      <p class="text-gray-600">文字超链接。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">链接变体</h2>
      <p class="text-gray-600 mb-6">展示 primary / secondary / default 三种变体（点击不跳转）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="#" variant="primary" @click="handlePreventNavigate">Primary</Link>
          <Link href="#" variant="secondary" @click="handlePreventNavigate">Secondary</Link>
          <Link href="#" variant="default" @click="handlePreventNavigate">Default</Link>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 链接尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">链接尺寸</h2>
      <p class="text-gray-600 mb-6">展示 sm / md / lg 三种尺寸（点击不跳转）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="#" size="sm" @click="handlePreventNavigate">Small</Link>
          <Link href="#" size="md" @click="handlePreventNavigate">Medium</Link>
          <Link href="#" size="lg" @click="handlePreventNavigate">Large</Link>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">禁用后不可点击，移除 href，并从 Tab 顺序移除。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="#" disabled>Disabled Link</Link>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 下划线 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">下划线</h2>
      <p class="text-gray-600 mb-6">underline=true 悬停显示下划线；underline=false 无下划线。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Link href="#" underline @click="handlePreventNavigate">有下划线（悬停）</Link>
          <Link href="#" :underline="false" @click="handlePreventNavigate">无下划线</Link>
        </Space>
      </div>
    </section>
  </div>
</template>
