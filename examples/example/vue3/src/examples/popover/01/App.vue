<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { List } from '@expcat/tigercat-vue/List'
import { ref } from 'vue'
import { Popover } from '@expcat/tigercat-vue/Popover'

const visible1 = ref(false)
const manualVisible = ref(false)

const customContentItems = [
  { key: 1, title: '列表项 1' },
  { key: 2, title: '列表项 2' },
  { key: 3, title: '列表项 3' }
]
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popover content="这是一个气泡卡片的内容">
            <Button>触发气泡卡片</Button>
          </Popover>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">带标题</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popover title="气泡卡片标题" content="这是一个带标题的气泡卡片内容">
            <Button>带标题的气泡卡片</Button>
          </Popover>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义内容</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popover>
            <template #title>
              <span style="color: #2563eb">自定义标题</span>
            </template>
            <template #content>
              <div>
                <p class="mb-2">这是自定义的内容</p>
                <List
                  class="text-sm"
                  bordered="none"
                  :split="false"
                  size="sm"
                  :dataSource="customContentItems">
                  <template #renderItem="{ item }">
                    <div class="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{{ item.title }}</span>
                    </div>
                  </template>
                </List>
              </div>
            </template>
            <Button>自定义内容</Button>
          </Popover>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <Popover title="提示" content="上方弹出" placement="top">
              <Button>上方</Button>
            </Popover>

            <Popover title="提示" content="下方弹出" placement="bottom">
              <Button>下方</Button>
            </Popover>

            <Popover title="提示" content="左侧弹出" placement="left">
              <Button>左侧</Button>
            </Popover>

            <Popover title="提示" content="右侧弹出" placement="right">
              <Button>右侧</Button>
            </Popover>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">触发方式</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Popover title="点击触发" content="点击按钮触发" trigger="click">
              <Button>点击触发</Button>
            </Popover>

            <Popover title="悬停触发" content="悬停触发气泡卡片" trigger="hover">
              <Button>悬停触发</Button>
            </Popover>

            <Popover title="聚焦触发" content="聚焦触发气泡卡片" trigger="focus">
              <Button>聚焦触发</Button>
            </Popover>

            <Popover
              v-model:open="manualVisible"
              title="手动触发"
              content="手动控制显示隐藏"
              trigger="manual">
              <Button @click="manualVisible = !manualVisible">手动触发</Button>
            </Popover>
          </Space>
        </div>
      </div>
    </div>
  </div>
</template>
