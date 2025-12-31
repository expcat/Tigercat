<script setup lang="ts">
import { ref } from 'vue'
import { Badge, Space, Divider } from '@tigercat/vue'

const notificationCount = ref(5)
const messageCount = ref(99)
const cartItems = ref(3)

const incrementNotifications = () => {
  notificationCount.value++
}

const clearNotifications = () => {
  notificationCount.value = 0
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Badge 徽章</h1>
      <p class="text-gray-600">用于标记和通知的徽章组件，支持点状、数字、文本等多种展示方式。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">独立使用徽章展示数字或文本。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Badge :content="5" />
          <Badge :content="99" />
          <Badge content="Hot" />
          <Badge content="NEW" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 徽章类型 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">徽章类型</h2>
      <p class="text-gray-600 mb-6">徽章有六种颜色类型：默认、主要、成功、警告、危险和信息。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space wrap>
          <Badge variant="default" :content="1" />
          <Badge variant="primary" :content="2" />
          <Badge variant="success" :content="3" />
          <Badge variant="warning" :content="4" />
          <Badge variant="danger" :content="5" />
          <Badge variant="info" :content="6" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 徽章大小 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">徽章大小</h2>
      <p class="text-gray-600 mb-6">徽章有三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space align="center">
          <Badge size="sm" :content="5" />
          <Badge size="md" :content="10" />
          <Badge size="lg" :content="99" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 点状徽章 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">点状徽章</h2>
      <p class="text-gray-600 mb-6">用于简单的通知提示，不显示具体数字。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space wrap>
          <Badge type="dot" variant="default" />
          <Badge type="dot" variant="primary" />
          <Badge type="dot" variant="success" />
          <Badge type="dot" variant="warning" />
          <Badge type="dot" variant="danger" />
          <Badge type="dot" variant="info" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文本徽章 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文本徽章</h2>
      <p class="text-gray-600 mb-6">显示文本内容的徽章。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space wrap>
          <Badge type="text" content="NEW" variant="danger" />
          <Badge type="text" content="HOT" variant="warning" />
          <Badge type="text" content="VIP" variant="primary" />
          <Badge type="text" content="推荐" variant="success" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 最大值 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">最大值</h2>
      <p class="text-gray-600 mb-6">设置 max 属性，当数字超过最大值时显示 {max}+。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Badge :content="99" />
          <Badge :content="100" />
          <Badge :content="150" :max="99" />
          <Badge :content="1000" :max="999" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 包裹模式 - 按钮 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">包裹元素</h2>
      <p class="text-gray-600 mb-6">徽章可以附加到其他元素上，通过设置 standalone 为 false 启用包裹模式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Badge :content="5" :standalone="false">
            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              通知
            </button>
          </Badge>
          
          <Badge :content="99" :standalone="false" variant="danger">
            <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              消息
            </button>
          </Badge>
          
          <Badge type="dot" :standalone="false" variant="danger">
            <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              邮件
            </button>
          </Badge>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 徽章位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">徽章位置</h2>
      <p class="text-gray-600 mb-6">在包裹模式下，可以设置徽章的位置。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space wrap>
          <Badge :content="5" :standalone="false" position="top-right">
            <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右上</div>
          </Badge>
          
          <Badge :content="5" :standalone="false" position="top-left">
            <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左上</div>
          </Badge>
          
          <Badge :content="5" :standalone="false" position="bottom-right">
            <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右下</div>
          </Badge>
          
          <Badge :content="5" :standalone="false" position="bottom-left">
            <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左下</div>
          </Badge>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 显示零值 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">显示零值</h2>
      <p class="text-gray-600 mb-6">默认情况下不显示零值，设置 showZero 可以显示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <div>
            <p class="text-sm text-gray-600 mb-2">默认（不显示零）</p>
            <Badge :content="0" />
            <span class="text-gray-500 ml-2">（无徽章）</span>
          </div>
          
          <div>
            <p class="text-sm text-gray-600 mb-2">显示零值</p>
            <Badge :content="0" :show-zero="true" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 实际应用示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">实际应用示例</h2>
      <p class="text-gray-600 mb-6">模拟真实的使用场景。</p>
      
      <!-- 通知示例 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">通知中心</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Badge :content="notificationCount" :standalone="false" variant="danger">
              <button 
                class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                @click="incrementNotifications"
              >
                🔔 通知
              </button>
            </Badge>
            
            <button 
              class="px-4 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              @click="clearNotifications"
            >
              清除通知
            </button>
          </Space>
        </div>
      </div>

      <!-- 消息计数 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">消息和购物车</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Badge :content="messageCount" :standalone="false" variant="primary" :max="99">
              <button class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600">
                💬 消息
              </button>
            </Badge>
            
            <Badge :content="cartItems" :standalone="false" variant="danger">
              <button class="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600">
                🛒 购物车
              </button>
            </Badge>
          </Space>
        </div>
      </div>

      <!-- 在线状态 -->
      <div>
        <h3 class="text-lg font-semibold mb-3">在线状态指示</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space wrap>
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="success" :standalone="false">
                <div class="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  张三
                </div>
              </Badge>
              <span class="text-green-600 font-medium">在线</span>
            </div>
            
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="default" :standalone="false">
                <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                  李四
                </div>
              </Badge>
              <span class="text-gray-500">离线</span>
            </div>
            
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="warning" :standalone="false">
                <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                  王五
                </div>
              </Badge>
              <span class="text-yellow-600">忙碌</span>
            </div>
          </Space>
        </div>
      </div>
    </section>
  </div>
</template>
