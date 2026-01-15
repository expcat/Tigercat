<script setup lang="ts">
import { notification, Divider, Button } from '@expcat/tigercat-vue'
import { ref } from 'vue'

const closeNotificationRef = ref<(() => void) | null>(null)

// 基本类型
const showInfo = () => {
  notification.info({
    title: '信息通知',
    description: '这是一条信息通知的详细描述内容'
  })
}

const showSuccess = () => {
  notification.success({
    title: '操作成功',
    description: '您的操作已经成功完成！'
  })
}

const showWarning = () => {
  notification.warning({
    title: '警告提示',
    description: '请注意相关事项，以避免潜在问题'
  })
}

const showError = () => {
  notification.error({
    title: '操作失败',
    description: '操作失败，请检查网络连接后重试'
  })
}

// 不同位置
const showTopLeft = () => {
  notification.info({
    title: '左上角通知',
    description: '这是显示在左上角的通知',
    position: 'top-left'
  })
}

const showTopRight = () => {
  notification.success({
    title: '右上角通知',
    description: '这是显示在右上角的通知（默认位置）',
    position: 'top-right'
  })
}

const showBottomLeft = () => {
  notification.warning({
    title: '左下角通知',
    description: '这是显示在左下角的通知',
    position: 'bottom-left'
  })
}

const showBottomRight = () => {
  notification.error({
    title: '右下角通知',
    description: '这是显示在右下角的通知',
    position: 'bottom-right'
  })
}

// 自定义持续时间
const showShortNotification = () => {
  notification.info({
    title: '短时间通知',
    description: '这条通知2秒后关闭',
    duration: 2000
  })
}

const showLongNotification = () => {
  notification.success({
    title: '长时间通知',
    description: '这条通知10秒后关闭',
    duration: 10000
  })
}

const showPersistentNotification = () => {
  notification.warning({
    title: '持久通知',
    description: '这条通知需要手动关闭',
    duration: 0
  })
}

// 可关闭性
const showClosableNotification = () => {
  notification.info({
    title: '可关闭通知',
    description: '这条通知可以通过点击关闭按钮来关闭',
    closable: true,
    duration: 0
  })
}

const showNonClosableNotification = () => {
  notification.success({
    title: '不可手动关闭',
    description: '这条通知没有关闭按钮，5秒后自动消失',
    closable: false,
    duration: 5000
  })
}

// 手动控制
const showNotification = () => {
  closeNotificationRef.value = notification.info({
    title: '处理中',
    description: '正在处理您的请求...',
    duration: 0
  })
}

const closeManually = () => {
  if (closeNotificationRef.value) {
    closeNotificationRef.value()
    closeNotificationRef.value = null
  }
}

const simulateRequest = async () => {
  const close = notification.info({
    title: '请求处理',
    description: '正在处理您的请求...',
    duration: 0
  })

  await new Promise((resolve) => setTimeout(resolve, 3000))

  close()
  notification.success({
    title: '请求成功',
    description: '您的请求已成功处理！'
  })
}

// 点击事件
const showClickableNotification = () => {
  notification.info({
    title: '可点击通知',
    description: '点击这条通知查看详情',
    onClick: () => {
      console.log('通知被点击了')
      alert('查看详情功能')
    }
  })
}

// 回调函数
const showNotificationWithCallback = () => {
  notification.success({
    title: '操作成功',
    description: '您的操作已经成功完成！',
    onClose: () => {
      console.log('通知已关闭')
    }
  })
}

// 清空通知
const showMultipleNotifications = () => {
  notification.info({
    title: '通知 1',
    description: '第一条通知',
    position: 'top-right'
  })

  notification.success({
    title: '通知 2',
    description: '第二条通知',
    position: 'top-left'
  })

  notification.warning({
    title: '通知 3',
    description: '第三条通知',
    position: 'bottom-right'
  })
}

const clearAll = () => {
  notification.clear()
}

const clearTopRight = () => {
  notification.clear('top-right')
}

// 快速使用
const quickInfo = () => {
  notification.info('快速信息通知')
}

const quickSuccess = () => {
  notification.success('快速成功通知')
}

const quickWarning = () => {
  notification.warning('快速警告通知')
}

const quickError = () => {
  notification.error('快速错误通知')
}
</script>

<template>
  <div class="p-6 space-y-8">
    <div>
      <h1 class="text-2xl font-bold mb-2">Notification 通知</h1>
      <p class="text-gray-600">全局显示通知提示信息，支持多种展示位置、关闭与定时消失。</p>
    </div>

    <Divider />

    <!-- 基本类型 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">基本类型</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showInfo"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          信息
        </Button>
        <Button
          @click="showSuccess"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          成功
        </Button>
        <Button
          @click="showWarning"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
          警告
        </Button>
        <Button @click="showError" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          错误
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 不同位置 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">不同位置</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showTopLeft"
          class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
          左上角
        </Button>
        <Button
          @click="showTopRight"
          class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
          右上角
        </Button>
        <Button
          @click="showBottomLeft"
          class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
          左下角
        </Button>
        <Button
          @click="showBottomRight"
          class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
          右下角
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 自定义持续时间 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">自定义持续时间</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showShortNotification"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          短时间（2秒）
        </Button>
        <Button
          @click="showLongNotification"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          长时间（10秒）
        </Button>
        <Button
          @click="showPersistentNotification"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          不自动关闭
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 可关闭性 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">可关闭性</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showClosableNotification"
          class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
          可关闭
        </Button>
        <Button
          @click="showNonClosableNotification"
          class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
          不可关闭
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 手动控制 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">手动控制</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showNotification"
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          显示通知
        </Button>
        <Button
          @click="closeManually"
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          手动关闭
        </Button>
        <Button
          @click="simulateRequest"
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          模拟请求
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 点击和回调 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">点击和回调</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showClickableNotification"
          class="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
          可点击通知
        </Button>
        <Button
          @click="showNotificationWithCallback"
          class="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
          带回调通知
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 清空通知 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">清空通知</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="showMultipleNotifications"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          显示多条通知
        </Button>
        <Button
          @click="clearAll"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          清空所有
        </Button>
        <Button
          @click="clearTopRight"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          清空右上角
        </Button>
      </div>
    </div>

    <Divider />

    <!-- 快速使用 -->
    <div>
      <h2 class="text-lg font-semibold mb-4">快速使用（仅标题）</h2>
      <div class="flex flex-wrap gap-2">
        <Button
          @click="quickInfo"
          class="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600">
          快速信息
        </Button>
        <Button
          @click="quickSuccess"
          class="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600">
          快速成功
        </Button>
        <Button
          @click="quickWarning"
          class="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600">
          快速警告
        </Button>
        <Button
          @click="quickError"
          class="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600">
          快速错误
        </Button>
      </div>
    </div>
  </div>
</template>
