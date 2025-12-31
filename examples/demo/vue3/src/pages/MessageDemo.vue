<script setup lang="ts">
import { message, Divider } from '@tigercat/vue'
import { ref } from 'vue'

const closeMessageRef = ref<(() => void) | null>(null)

const showInfo = () => {
  message.info('这是一条信息提示')
}

const showSuccess = () => {
  message.success('操作成功！')
}

const showWarning = () => {
  message.warning('请注意相关事项')
}

const showError = () => {
  message.error('操作失败，请重试')
}

const showLoading = () => {
  const close = message.loading('加载中...')
  setTimeout(close, 3000)
}

const showShortMessage = () => {
  message.info({
    content: '这条消息1秒后关闭',
    duration: 1000,
  })
}

const showLongMessage = () => {
  message.success({
    content: '这条消息5秒后关闭',
    duration: 5000,
  })
}

const showPersistentMessage = () => {
  message.warning({
    content: '这条消息需要手动关闭',
    duration: 0,
    closable: true,
  })
}

const showClosableMessage = () => {
  message.info({
    content: '这条消息可以手动关闭',
    closable: true,
    duration: 0,
  })
}

const showMessage = () => {
  closeMessageRef.value = message.loading('正在处理请求...')
}

const closeManually = () => {
  if (closeMessageRef.value) {
    closeMessageRef.value()
    closeMessageRef.value = null
  }
}

const simulateRequest = async () => {
  const close = message.loading('正在提交表单...')
  
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  close()
  message.success({
    content: '表单提交成功！',
    duration: 3000,
    onClose: () => {
      console.log('成功消息已关闭')
    },
  })
}

const showMultipleMessages = () => {
  message.info('消息 1')
  setTimeout(() => message.success('消息 2'), 300)
  setTimeout(() => message.warning('消息 3'), 600)
}

const clearAll = () => {
  message.clear()
}

const showMessageWithCallback = () => {
  message.success({
    content: '操作成功！',
    onClose: () => {
      console.log('消息已关闭')
    },
  })
}

const showCustomClass = () => {
  message.info({
    content: '自定义样式的消息',
    className: 'shadow-2xl',
  })
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Message 消息提示</h1>
      <p class="text-gray-600">全局展示操作反馈信息，支持多种状态、自动关闭、队列管理等功能。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，调用 message 方法即可显示消息提示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="space-x-2">
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showInfo"
          >
            信息
          </button>
          <button 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            @click="showSuccess"
          >
            成功
          </button>
          <button 
            class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            @click="showWarning"
          >
            警告
          </button>
          <button 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            @click="showError"
          >
            错误
          </button>
          <button 
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            @click="showLoading"
          >
            加载
          </button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义持续时间 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义持续时间</h2>
      <p class="text-gray-600 mb-6">通过 duration 属性自定义消息显示时间，设置为 0 时不会自动关闭。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="space-x-2">
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showShortMessage"
          >
            短时间（1秒）
          </button>
          <button 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            @click="showLongMessage"
          >
            长时间（5秒）
          </button>
          <button 
            class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            @click="showPersistentMessage"
          >
            不自动关闭
          </button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 手动关闭 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">手动关闭</h2>
      <p class="text-gray-600 mb-6">设置 closable 为 true 显示关闭按钮，或使用返回的关闭函数。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="space-x-2 mb-4">
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showClosableMessage"
          >
            显示可关闭消息
          </button>
        </div>
        <div class="space-x-2">
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showMessage"
          >
            显示加载消息
          </button>
          <button 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            @click="closeManually"
          >
            手动关闭
          </button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 完整流程示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">完整流程示例</h2>
      <p class="text-gray-600 mb-6">模拟表单提交的完整流程。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <button 
          class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          @click="simulateRequest"
        >
          提交表单（模拟请求）
        </button>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 队列管理 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">队列管理</h2>
      <p class="text-gray-600 mb-6">支持多条消息同时显示，可以一次清空所有消息。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="space-x-2">
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showMultipleMessages"
          >
            显示多条消息
          </button>
          <button 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            @click="clearAll"
          >
            清空所有消息
          </button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 回调函数 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">回调函数</h2>
      <p class="text-gray-600 mb-6">可以通过 onClose 回调函数在消息关闭时执行特定操作（查看控制台）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <button 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          @click="showMessageWithCallback"
        >
          显示消息（带回调）
        </button>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义样式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义样式</h2>
      <p class="text-gray-600 mb-6">可以通过 className 属性添加自定义样式类。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <button 
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          @click="showCustomClass"
        >
          自定义样式
        </button>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 实际应用场景 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">实际应用场景</h2>
      <p class="text-gray-600 mb-6">常见的使用场景示例。</p>
      
      <div class="space-y-4">
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">文件上传</h3>
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="() => {
              const close = message.loading('正在上传文件...')
              setTimeout(() => {
                close()
                message.success('文件上传成功')
              }, 2000)
            }"
          >
            上传文件
          </button>
        </div>

        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">保存设置</h3>
          <button 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            @click="() => {
              message.loading('正在保存设置...')
              setTimeout(() => {
                message.success({
                  content: '设置保存成功',
                  duration: 2000,
                })
              }, 1000)
            }"
          >
            保存设置
          </button>
        </div>

        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">删除确认</h3>
          <button 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            @click="() => {
              message.warning({
                content: '确定要删除这条记录吗？',
                duration: 5000,
                closable: true,
              })
            }"
          >
            删除记录
          </button>
        </div>

        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">网络错误</h3>
          <button 
            class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            @click="() => {
              message.error({
                content: '网络连接失败，请检查您的网络设置',
                duration: 0,
                closable: true,
              })
            }"
          >
            模拟网络错误
          </button>
        </div>
      </div>
    </section>

    <div class="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-lg font-semibold mb-2 text-blue-800">💡 提示</h3>
      <ul class="list-disc list-inside text-blue-700 space-y-1">
        <li>消息默认会在 3 秒后自动关闭</li>
        <li>loading 类型的消息不会自动关闭，需要手动关闭</li>
        <li>多条消息会依次排列显示，形成队列</li>
        <li>可以通过 message.clear() 清空所有正在显示的消息</li>
        <li>Message 与 Alert 的区别：Message 是全局提示，Alert 是页面内嵌提示</li>
      </ul>
    </div>
  </div>
</template>
