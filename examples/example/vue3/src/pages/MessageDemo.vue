<script setup lang="ts">
import { message, Button, List } from '@expcat/tigercat-vue'
import { ref } from 'vue'
import DemoBlock from '../components/DemoBlock.vue'

const manualLoadingCloseFns = ref<Array<() => void>>([])

const delay = (cb: () => void, ms: number) => setTimeout(cb, ms)

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
    duration: 1000
  })
}

const showLongMessage = () => {
  message.success({
    content: '这条消息5秒后关闭',
    duration: 5000
  })
}

const showPersistentMessage = () => {
  message.warning({
    content: '这条消息需要手动关闭',
    duration: 0,
    closable: true
  })
}

const showClosableMessage = () => {
  message.info({
    content: '这条消息可以手动关闭',
    closable: true,
    duration: 0
  })
}

const showMessage = () => {
  const nextIndex = manualLoadingCloseFns.value.length + 1
  const close = message.loading(`正在处理请求...（${nextIndex}）`)
  manualLoadingCloseFns.value.push(close)
}

const closeManually = () => {
  const close = manualLoadingCloseFns.value.pop()
  if (close) {
    close()
  }
}

const closeAllManual = () => {
  const closers = manualLoadingCloseFns.value
  manualLoadingCloseFns.value = []
  for (const close of closers) {
    close()
  }
}

const simulateRequest = async () => {
  const close = message.loading('正在提交表单...')

  // 模拟异步请求
  await new Promise((resolve) => setTimeout(resolve, 2000))

  close()
  message.success({
    content: '表单提交成功！',
    duration: 3000,
    onClose: () => {
      console.log('成功消息已关闭')
    }
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
    }
  })
}

const showCustomClass = () => {
  message.info({
    content: '自定义样式的消息',
    className: 'shadow-2xl'
  })
}

const tips = [
  { key: 1, title: '消息默认会在 3 秒后自动关闭' },
  { key: 2, title: 'loading 类型的消息不会自动关闭，需要手动关闭' },
  { key: 3, title: '多条消息会依次排列显示，形成队列' },
  { key: 4, title: '可以通过 message.clear() 清空所有正在显示的消息' },
  { key: 5, title: 'Message 与 Alert 的区别：Message 是全局提示，Alert 是页面内嵌提示' }
]

const basicSnippet = `<div class="flex flex-wrap gap-2">
  <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showInfo">
    信息
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showSuccess">
    成功
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showWarning">
    警告
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showError">
    错误
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showLoading">
    加载
  </Button>
</div>`

const durationSnippet = `<div class="flex flex-wrap gap-2">
  <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showShortMessage">
    短时间（1秒）
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showLongMessage">
    长时间（5秒）
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showPersistentMessage">
    不自动关闭
  </Button>
</div>`

const manualSnippet = `<div class="flex flex-wrap gap-2 mb-4">
  <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showClosableMessage">
    显示可关闭消息
  </Button>
</div>
<div class="flex flex-wrap gap-2 items-center">
  <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showMessage">
    显示加载消息
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="closeManually" :disabled="manualLoadingCloseFns.length === 0">
    关闭最后一个
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="closeAllManual" :disabled="manualLoadingCloseFns.length === 0">
    关闭全部
  </Button>
  <span class="text-sm text-gray-600 dark:text-gray-300">当前可手动关闭：{{ manualLoadingCloseFns.length }} 条</span>
</div>`

const flowSnippet = `<Button class="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="simulateRequest">
  提交表单（模拟请求）
</Button>`

const queueSnippet = `<div class="flex flex-wrap gap-2">
  <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showMultipleMessages">
    显示多条消息
  </Button>
  <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="clearAll">
    清空所有消息
  </Button>
</div>`

const callbackSnippet = `<Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showMessageWithCallback">
  显示消息（带回调）
</Button>`

const customSnippet = `<Button class="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="showCustomClass">
  自定义样式
</Button>`

const sceneSnippet = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <h3 class="text-lg font-semibold mb-3">文件上传</h3>
    <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="() => { const close = message.loading('正在上传文件...'); delay(() => { close(); message.success('文件上传成功') }, 2000) }">
      上传文件
    </Button>
  </div>

  <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <h3 class="text-lg font-semibold mb-3">保存设置</h3>
    <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="() => { const close = message.loading('正在保存设置...'); delay(() => { close(); message.success({ content: '设置保存成功', duration: 2000 }) }, 1000) }">
      保存设置
    </Button>
  </div>

  <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <h3 class="text-lg font-semibold mb-3">删除确认</h3>
    <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="() => { message.warning({ content: '确定要删除这条记录吗？', duration: 5000, closable: true }) }">
      删除记录
    </Button>
  </div>

  <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <h3 class="text-lg font-semibold mb-3">网络错误</h3>
    <Button class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950" @click="() => { message.error({ content: '网络连接失败，请检查您的网络设置', duration: 0, closable: true }) }">
      模拟网络错误
    </Button>
  </div>
</div>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8 text-gray-900 dark:text-gray-100">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Message 消息提示</h1>
      <p class="text-gray-600 dark:text-gray-300">
        全局展示操作反馈信息，支持多种状态、自动关闭、队列管理等功能。
      </p>
    </div>

    <!-- 基本用法 -->
    <DemoBlock title="基本用法"
               description="最简单的用法，调用 message 方法即可显示消息提示。"
               :code="basicSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <div class="flex flex-wrap gap-2">
          <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showInfo">
            信息
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showSuccess">
            成功
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showWarning">
            警告
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showError">
            错误
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showLoading">
            加载
          </Button>
        </div>
      </div>
    </DemoBlock>

    <!-- 自定义持续时间 -->
    <DemoBlock title="自定义持续时间"
               description="通过 duration 属性自定义消息显示时间，设置为 0 时不会自动关闭。"
               :code="durationSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <div class="flex flex-wrap gap-2">
          <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showShortMessage">
            短时间（1秒）
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showLongMessage">
            长时间（5秒）
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showPersistentMessage">
            不自动关闭
          </Button>
        </div>
      </div>
    </DemoBlock>

    <!-- 手动关闭 -->
    <DemoBlock title="手动关闭"
               description="设置 closable 为 true 显示关闭按钮，或使用返回的关闭函数。此示例支持同时打开多条 loading，并提供逐条/一键关闭。"
               :code="manualSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <div class="flex flex-wrap gap-2 mb-4">
          <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showClosableMessage">
            显示可关闭消息
          </Button>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showMessage">
            显示加载消息
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="closeManually"
                  :disabled="manualLoadingCloseFns.length === 0">
            关闭最后一个
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="closeAllManual"
                  :disabled="manualLoadingCloseFns.length === 0">
            关闭全部
          </Button>
          <span class="text-sm text-gray-600 dark:text-gray-300">
            当前可手动关闭：{{ manualLoadingCloseFns.length }} 条
          </span>
        </div>
      </div>
    </DemoBlock>

    <!-- 完整流程示例 -->
    <DemoBlock title="完整流程示例"
               description="模拟表单提交的完整流程。"
               :code="flowSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <Button class="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                @click="simulateRequest">
          提交表单（模拟请求）
        </Button>
      </div>
    </DemoBlock>

    <!-- 队列管理 -->
    <DemoBlock title="队列管理"
               description="支持多条消息同时显示，可以一次清空所有消息。"
               :code="queueSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <div class="flex flex-wrap gap-2">
          <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="showMultipleMessages">
            显示多条消息
          </Button>
          <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="clearAll">
            清空所有消息
          </Button>
        </div>
      </div>
    </DemoBlock>

    <!-- 回调函数 -->
    <DemoBlock title="回调函数"
               description="可以通过 onClose 回调函数在消息关闭时执行特定操作（查看控制台）。"
               :code="callbackSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                @click="showMessageWithCallback">
          显示消息（带回调）
        </Button>
      </div>
    </DemoBlock>

    <!-- 自定义样式 -->
    <DemoBlock title="自定义样式"
               description="可以通过 className 属性添加自定义样式类。"
               :code="customSnippet">
      <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <Button class="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                @click="showCustomClass">
          自定义样式
        </Button>
      </div>
    </DemoBlock>

    <!-- 实际应用场景 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">实际应用场景</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">常见的使用场景示例。</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <h3 class="text-lg font-semibold mb-3">文件上传</h3>
          <Button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="
                    () => {
                      const close = message.loading('正在上传文件...')
                      delay(() => {
                        close()
                        message.success('文件上传成功')
                      }, 2000)
                    }
                  ">
            上传文件
          </Button>
        </div>

        <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <h3 class="text-lg font-semibold mb-3">保存设置</h3>
          <Button class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="
                    () => {
                      const close = message.loading('正在保存设置...')
                      delay(() => {
                        close()
                        message.success({
                          content: '设置保存成功',
                          duration: 2000
                        })
                      }, 1000)
                    }
                  ">
            保存设置
          </Button>
        </div>

        <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <h3 class="text-lg font-semibold mb-3">删除确认</h3>
          <Button class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="
                    () => {
                      message.warning({
                        content: '确定要删除这条记录吗？',
                        duration: 5000,
                        closable: true
                      })
                    }
                  ">
            删除记录
          </Button>
        </div>

        <div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <h3 class="text-lg font-semibold mb-3">网络错误</h3>
          <Button class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                  @click="
                    () => {
                      message.error({
                        content: '网络连接失败，请检查您的网络设置',
                        duration: 0,
                        closable: true
                      })
                    }
                  ">
            模拟网络错误
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
