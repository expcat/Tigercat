<script setup lang="ts">
import { Button, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const typeSnippet = `<Space wrap>
  <Button variant="primary">主要按钮</Button>
  <Button variant="secondary">次要按钮</Button>
  <Button variant="outline">轮廓按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="link">链接按钮</Button>
</Space>`

const sizeSnippet = `<Space align="center">
  <Button size="sm">小按钮</Button>
  <Button size="md">中按钮</Button>
  <Button size="lg">大按钮</Button>
</Space>`

const stateSnippet = `<Space direction="vertical" class="w-full">
  <div>
    <h3 class="text-sm font-semibold mb-2 text-gray-700">正常状态</h3>
    <Space>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
    </Space>
  </div>
  <div>
    <h3 class="text-sm font-semibold mb-2 text-gray-700">禁用状态</h3>
    <Space>
      <Button variant="primary" disabled>主要按钮</Button>
      <Button variant="secondary" disabled>次要按钮</Button>
      <Button variant="outline" disabled>轮廓按钮</Button>
    </Space>
  </div>
  <div>
    <h3 class="text-sm font-semibold mb-2 text-gray-700">加载状态</h3>
    <Space>
      <Button variant="primary" loading>主要按钮</Button>
      <Button variant="secondary" loading>次要按钮</Button>
      <Button variant="outline" loading>轮廓按钮</Button>
    </Space>
  </div>
</Space>`

const blockSnippet = `<Space direction="vertical" class="w-full">
  <Button variant="primary" block>主要按钮</Button>
  <Button variant="secondary" block>次要按钮</Button>
  <Button variant="outline" block>轮廓按钮</Button>
</Space>`

const fullWidthSnippet = `<Space direction="vertical" class="w-full">
  <Button variant="primary" class="w-1/2">50% 宽度</Button>
  <Button variant="secondary" class="w-3/4">75% 宽度</Button>
  <Button variant="outline" class="w-full">100% 宽度</Button>
</Space>`

const customLoadingSnippet = `<Button loading>
  <template #loading-icon>
    <span class="animate-spin inline-block">🔄</span>
  </template>
  自定义图标
</Button>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Button 按钮</h1>
      <p class="text-gray-600">按钮用于触发一个操作。</p>
    </div>

    <!-- 按钮类型 -->
    <DemoBlock title="按钮类型"
               description="按钮有五种类型：主要按钮、次要按钮、轮廓按钮、幽灵按钮和链接按钮。"
               :code="typeSnippet">
      <Space wrap>
        <Button variant="primary">主要按钮</Button>
        <Button variant="secondary">次要按钮</Button>
        <Button variant="outline">轮廓按钮</Button>
        <Button variant="ghost">幽灵按钮</Button>
        <Button variant="link">链接按钮</Button>
      </Space>
    </DemoBlock>

    <!-- 按钮大小 -->
    <DemoBlock title="按钮大小"
               description="按钮有三种尺寸：小、中、大。"
               :code="sizeSnippet">
      <Space align="center">
        <Button size="sm">小按钮</Button>
        <Button size="md">中按钮</Button>
        <Button size="lg">大按钮</Button>
      </Space>
    </DemoBlock>

    <!-- 按钮状态 -->
    <DemoBlock title="按钮状态"
               description="按钮可以处于正常、禁用或加载状态。"
               :code="stateSnippet">
      <Space direction="vertical"
             class="w-full">
        <div>
          <h3 class="text-sm font-semibold mb-2 text-gray-700">正常状态</h3>
          <Space>
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
          </Space>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-2 text-gray-700">禁用状态</h3>
          <Space>
            <Button variant="primary"
                    disabled>主要按钮</Button>
            <Button variant="secondary"
                    disabled>次要按钮</Button>
            <Button variant="outline"
                    disabled>轮廓按钮</Button>
          </Space>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-2 text-gray-700">加载状态</h3>
          <Space>
            <Button variant="primary"
                    loading>主要按钮</Button>
            <Button variant="secondary"
                    loading>次要按钮</Button>
            <Button variant="outline"
                    loading>轮廓按钮</Button>
          </Space>
        </div>
      </Space>
    </DemoBlock>

    <!-- 自定义加载图标 -->
    <DemoBlock title="自定义加载图标"
               description="可以通过 slot 自定义加载状态下的图标。"
               :code="customLoadingSnippet">
      <Button loading>
        <template #loading-icon>
          <span class="animate-spin inline-block">🔄</span>
        </template>
        自定义图标
      </Button>
    </DemoBlock>

    <!-- 块级按钮 -->
    <DemoBlock title="块级按钮"
               description="block 属性将使按钮适合其父宽度。"
               :code="blockSnippet">
      <Space direction="vertical"
             class="w-full">
        <Button variant="primary"
                block>主要按钮</Button>
        <Button variant="secondary"
                block>次要按钮</Button>
        <Button variant="outline"
                block>轮廓按钮</Button>
      </Space>
    </DemoBlock>

    <!-- 自定义宽度按钮 -->
    <DemoBlock title="自定义宽度按钮"
               description="使用 class 设置按钮为任意宽度，与 block 属性不同，可以灵活控制宽度比例。"
               :code="fullWidthSnippet">
      <Space direction="vertical"
             class="w-full">
        <Button variant="primary"
                class="w-1/2">50% 宽度</Button>
        <Button variant="secondary"
                class="w-3/4">75% 宽度</Button>
        <Button variant="outline"
                class="w-full">100% 宽度</Button>
      </Space>
    </DemoBlock>
  </div>
</template>
