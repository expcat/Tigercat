<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Tooltip } from '@expcat/tigercat-vue/Tooltip'

const visible1 = ref(false)
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <Tooltip content="这是一个气泡提示">
          <Button>悬停显示提示</Button>
        </Tooltip>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
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
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">触发方式</h3>
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
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义内容</h3>
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
    </div>
  </div>
</template>
