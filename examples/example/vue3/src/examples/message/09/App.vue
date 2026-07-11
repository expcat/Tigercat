<script setup lang="ts">
import { Message } from '@expcat/tigercat-vue/Message'
import { Button } from '@expcat/tigercat-vue/Button'
import { List } from '@expcat/tigercat-vue/List'
import { ref } from 'vue'

const manualLoadingCloseFns = ref<Array<() => void>>([])

const delay = (cb: () => void, ms: number) => setTimeout(cb, ms)

const showInfo = () => {
  Message.info('这是一条信息提示')
}

const showSuccess = () => {
  Message.success('操作成功！')
}

const showWarning = () => {
  Message.warning('请注意相关事项')
}

const showError = () => {
  Message.error('操作失败，请重试')
}

const showLoading = () => {
  const close = Message.loading('加载中...')
  setTimeout(close, 3000)
}

const showShortMessage = () => {
  Message.info({
    content: '这条消息1秒后关闭',
    duration: 1000
  })
}

const showLongMessage = () => {
  Message.success({
    content: '这条消息5秒后关闭',
    duration: 5000
  })
}

const showPersistentMessage = () => {
  Message.warning({
    content: '这条消息需要手动关闭',
    duration: 0,
    closable: true
  })
}

const showClosableMessage = () => {
  Message.info({
    content: '这条消息可以手动关闭',
    closable: true,
    duration: 0
  })
}

const showMessage = () => {
  const nextIndex = manualLoadingCloseFns.value.length + 1
  const close = Message.loading(`正在处理请求...（${nextIndex}）`)
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
  const close = Message.loading('正在提交表单...')

  // 模拟异步请求
  await new Promise((resolve) => setTimeout(resolve, 2000))

  close()
  Message.success({
    content: '表单提交成功！',
    duration: 3000,
    onClose: () => {
      console.log('成功消息已关闭')
    }
  })
}

const showMultipleMessages = () => {
  Message.info('消息 1')
  setTimeout(() => Message.success('消息 2'), 300)
  setTimeout(() => Message.warning('消息 3'), 600)
}

const clearAll = () => {
  Message.clear()
}

const showMessageWithCallback = () => {
  Message.success({
    content: '操作成功！',
    onClose: () => {
      console.log('消息已关闭')
    }
  })
}

const showCustomClass = () => {
  Message.info({
    content: '自定义样式的消息',
    className: 'shadow-2xl'
  })
}

const showCustomIcon = () => {
  Message.info({
    content: '自定义图标的消息',
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'
  })
}

const tips = [
  { key: 1, title: '消息默认会在 3 秒后自动关闭' },
  { key: 2, title: 'loading 类型的消息不会自动关闭，需要手动关闭' },
  { key: 3, title: '多条消息会依次排列显示，形成队列' },
  { key: 4, title: '可以通过 Message.clear() 清空所有正在显示的消息' },
  { key: 5, title: 'Message 与 Alert 的区别：Message 是全局提示，Alert 是页面内嵌提示' }
]
</script>

<template>
  <div class="min-w-0">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <h3 class="text-lg font-semibold mb-3">文件上传</h3>
        <Button
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
          @click="
            () => {
              const close = Message.loading('正在上传文件...')
              delay(() => {
                close()
                Message.success('文件上传成功')
              }, 2000)
            }
          ">
          上传文件
        </Button>
      </div>

      <div
        class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <h3 class="text-lg font-semibold mb-3">保存设置</h3>
        <Button
          class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
          @click="
            () => {
              const close = Message.loading('正在保存设置...')
              delay(() => {
                close()
                Message.success({
                  content: '设置保存成功',
                  duration: 2000
                })
              }, 1000)
            }
          ">
          保存设置
        </Button>
      </div>

      <div
        class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <h3 class="text-lg font-semibold mb-3">删除确认</h3>
        <Button
          class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
          @click="
            () => {
              Message.warning({
                content: '确定要删除这条记录吗？',
                duration: 5000,
                closable: true
              })
            }
          ">
          删除记录
        </Button>
      </div>

      <div
        class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <h3 class="text-lg font-semibold mb-3">网络错误</h3>
        <Button
          class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
          @click="
            () => {
              Message.error({
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
  </div>
</template>
