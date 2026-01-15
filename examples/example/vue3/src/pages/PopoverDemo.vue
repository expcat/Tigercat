<script setup lang="ts">
import { ref } from 'vue'
import { Popover, Button, Space, Divider, List } from '@expcat/tigercat-vue'

const visible1 = ref(false)
const manualVisible = ref(false)

const customContentItems = [
  { key: 1, title: '列表项 1' },
  { key: 2, title: '列表项 2' },
  { key: 3, title: '列表项 3' }
]
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Popover 气泡卡片</h1>
      <p class="text-gray-600">用于显示复杂的自定义内容。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，点击按钮显示气泡卡片。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popover content="这是一个气泡卡片的内容">
          <Button>触发气泡卡片</Button>
        </Popover>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带标题 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带标题</h2>
      <p class="text-gray-600 mb-6">可以通过 title 属性设置标题。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popover title="气泡卡片标题" content="这是一个带标题的气泡卡片内容">
          <Button>带标题的气泡卡片</Button>
        </Popover>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义内容 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义内容</h2>
      <p class="text-gray-600 mb-6">可以通过插槽自定义内容。</p>
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
      <Divider class="my-6" />
    </section>

    <!-- 不同位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同位置</h2>
      <p class="text-gray-600 mb-6">通过 placement 属性设置弹出位置。</p>
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
      <Divider class="my-6" />
    </section>

    <!-- 触发方式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">触发方式</h2>
      <p class="text-gray-600 mb-6">支持 click、hover、focus、manual 四种触发方式。</p>
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
            v-model:visible="manualVisible"
            title="手动触发"
            content="手动控制显示隐藏"
            trigger="manual">
            <Button @click="manualVisible = !manualVisible">手动触发</Button>
          </Popover>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 受控模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">受控模式</h2>
      <p class="text-gray-600 mb-6">通过 v-model:visible 控制气泡卡片的显示状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Popover v-model:visible="visible1" title="受控气泡卡片" content="通过外部状态控制显示">
            <Button>受控气泡卡片</Button>
          </Popover>

          <Button @click="visible1 = !visible1">
            {{ visible1 ? '隐藏' : '显示' }}
          </Button>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义宽度 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义宽度</h2>
      <p class="text-gray-600 mb-6">通过 width 属性自定义气泡卡片的宽度。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Popover title="自定义宽度" content="这是一个宽度为 300px 的气泡卡片" width="300">
            <Button>宽度 300px</Button>
          </Popover>

          <Popover title="自定义宽度" content="这是一个宽度为 400px 的气泡卡片" width="400">
            <Button>宽度 400px</Button>
          </Popover>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">禁用状态下无法触发气泡卡片。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popover title="禁用状态" content="这个气泡卡片已被禁用" disabled>
          <Button disabled>禁用的气泡卡片</Button>
        </Popover>
      </div>
    </section>
  </div>
</template>
