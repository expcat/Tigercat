<script setup lang="ts">
import { ref } from 'vue'
import { Tooltip, Button, Space, Divider } from '@tigercat/vue'

const visible1 = ref(false)
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Tooltip 气泡提示</h1>
      <p class="text-gray-600">用于显示简洁的文本提示信息。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，悬停显示提示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Tooltip content="这是一个气泡提示">
          <Button>悬停显示提示</Button>
        </Tooltip>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同位置</h2>
      <p class="text-gray-600 mb-6">通过 placement 属性设置气泡提示的显示位置。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-4 gap-4">
          <div class="flex justify-center">
            <Tooltip content="顶部提示" placement="top">
              <Button>Top</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="顶部开始" placement="top-start">
              <Button>Top Start</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="顶部结束" placement="top-end">
              <Button>Top End</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="底部提示" placement="bottom">
              <Button>Bottom</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="底部开始" placement="bottom-start">
              <Button>Bottom Start</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="底部结束" placement="bottom-end">
              <Button>Bottom End</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="左侧提示" placement="left">
              <Button>Left</Button>
            </Tooltip>
          </div>
          
          <div class="flex justify-center">
            <Tooltip content="右侧提示" placement="right">
              <Button>Right</Button>
            </Tooltip>
          </div>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 触发方式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">触发方式</h2>
      <p class="text-gray-600 mb-6">支持 hover（默认）、click、focus 三种触发方式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space :size="16">
          <Tooltip content="悬停触发（默认）" trigger="hover">
            <Button>Hover</Button>
          </Tooltip>
          
          <Tooltip content="点击触发" trigger="click">
            <Button>Click</Button>
          </Tooltip>
          
          <Tooltip content="聚焦触发" trigger="focus">
            <Button>Focus</Button>
          </Tooltip>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义内容 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义内容</h2>
      <p class="text-gray-600 mb-6">可以通过插槽自定义提示内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Tooltip>
          <template #content>
            <div>
              <strong>自定义内容</strong>
              <p>这里可以包含任何内容</p>
            </div>
          </template>
          <Button>自定义提示</Button>
        </Tooltip>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 受控模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">受控模式</h2>
      <p class="text-gray-600 mb-6">可以通过 visible 属性控制气泡提示的显示和隐藏。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space :size="16">
          <Tooltip v-model:visible="visible1" content="受控的气泡提示">
            <Button>受控提示</Button>
          </Tooltip>
          
          <Button @click="visible1 = !visible1">
            {{ visible1 ? '隐藏' : '显示' }}
          </Button>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">通过 disabled 属性禁用气泡提示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space :size="16">
          <Tooltip content="正常提示">
            <Button>正常</Button>
          </Tooltip>
          
          <Tooltip content="禁用提示" disabled>
            <Button>禁用</Button>
          </Tooltip>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>
  </div>
</template>
