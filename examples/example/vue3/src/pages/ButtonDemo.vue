<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './ButtonDemo.vue?raw'

const clickCount = ref(0)
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Button 按钮</h1>
      <p class="text-gray-600 dark:text-gray-400">按钮用于触发一个操作。</p>
    </div>

    <DemoBlock
      title="外观、尺寸与状态"
      description="合并展示按钮类型、尺寸、禁用/加载状态和自定义加载图标。"
      :code="fullPageSnippet">
      <Space direction="vertical" class="w-full" size="lg">
        <div>
          <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">类型</h3>
          <Space wrap>
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="link">链接按钮</Button>
          </Space>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">尺寸</h3>
          <Space align="center">
            <Button size="sm">小按钮</Button>
            <Button size="md">中按钮</Button>
            <Button size="lg">大按钮</Button>
          </Space>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">状态</h3>
          <Space wrap>
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary" disabled>禁用按钮</Button>
            <Button variant="outline" loading>加载中</Button>
            <Button variant="primary" loading>
              <template #loading-icon>
                <span class="animate-spin inline-block">↻</span>
              </template>
              自定义加载图标
            </Button>
          </Space>
        </div>
      </Space>
    </DemoBlock>

    <DemoBlock
      title="行为与原生类型"
      description="合并展示点击事件和 HTML 原生 button 类型。"
      :code="fullPageSnippet">
      <Space direction="vertical" class="w-full" size="lg">
        <Space align="center">
          <Button variant="primary" @click="clickCount++">已点击 {{ clickCount }} 次</Button>
          <Button variant="secondary" @click="clickCount = 0">重置</Button>
        </Space>
        <form @submit.prevent>
          <Space>
            <Button htmlType="submit" variant="primary">提交</Button>
            <Button htmlType="reset" variant="outline">重置</Button>
            <Button htmlType="button" variant="ghost">普通按钮</Button>
          </Space>
        </form>
      </Space>
    </DemoBlock>

    <DemoBlock
      title="宽度"
      description="合并展示 block 填满容器和 class 自定义宽度两种方式。"
      :code="fullPageSnippet">
      <Space direction="vertical" class="w-full" size="lg">
        <Space direction="vertical" class="w-full">
          <Button variant="primary" block>block 主要按钮</Button>
          <Button variant="secondary" block>block 次要按钮</Button>
        </Space>
        <Space direction="vertical" class="w-full">
          <Button variant="primary" class="w-1/2">50% 宽度</Button>
          <Button variant="secondary" class="w-3/4">75% 宽度</Button>
          <Button variant="outline" class="w-full">100% 宽度</Button>
        </Space>
      </Space>
    </DemoBlock>
  </div>
</template>
