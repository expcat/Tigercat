<script setup lang="ts">
import { Link, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const handlePreventNavigate = (event: MouseEvent) => {
  event.preventDefault()
}

const variantSnippet = `<Space>
  <Link href="#" variant="primary">Primary</Link>
  <Link href="#" variant="secondary">Secondary</Link>
  <Link href="#" variant="default">Default</Link>
</Space>`

const sizeSnippet = `<Space>
  <Link href="#" size="sm">Small</Link>
  <Link href="#" size="md">Medium</Link>
  <Link href="#" size="lg">Large</Link>
</Space>`

const disabledSnippet = `<Space>
  <Link href="#" disabled>Disabled Link</Link>
</Space>`

const underlineSnippet = `<Space>
  <Link href="#" underline>有下划线（悬停）</Link>
  <Link href="#" :underline="false">无下划线</Link>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Link 链接</h1>
      <p class="text-gray-600">文字超链接。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="链接变体"
               description="展示 primary / secondary / default 三种变体（点击不跳转）。"
               :code="variantSnippet">
      <Space>
        <Link href="#"
              variant="primary"
              @click="handlePreventNavigate">Primary</Link>
        <Link href="#"
              variant="secondary"
              @click="handlePreventNavigate">Secondary</Link>
        <Link href="#"
              variant="default"
              @click="handlePreventNavigate">Default</Link>
      </Space>
    </DemoBlock>

    <!-- 链接尺寸 -->
    <DemoBlock title="链接尺寸"
               description="展示 sm / md / lg 三种尺寸（点击不跳转）。"
               :code="sizeSnippet">
      <Space>
        <Link href="#"
              size="sm"
              @click="handlePreventNavigate">Small</Link>
        <Link href="#"
              size="md"
              @click="handlePreventNavigate">Medium</Link>
        <Link href="#"
              size="lg"
              @click="handlePreventNavigate">Large</Link>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态"
               description="禁用后不可点击，移除 href，并从 Tab 顺序移除。"
               :code="disabledSnippet">
      <Space>
        <Link href="#"
              disabled>Disabled Link</Link>
      </Space>
    </DemoBlock>

    <!-- 下划线 -->
    <DemoBlock title="下划线"
               description="underline=true 悬停显示下划线；underline=false 无下划线。"
               :code="underlineSnippet">
      <Space>
        <Link href="#"
              underline
              @click="handlePreventNavigate">有下划线（悬停）</Link>
        <Link href="#"
              :underline="false"
              @click="handlePreventNavigate">无下划线</Link>
      </Space>
    </DemoBlock>
  </div>
</template>
