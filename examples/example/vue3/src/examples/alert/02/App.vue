<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { List } from '@expcat/tigercat-vue/List'
import { ref } from 'vue'
import { Alert } from '@expcat/tigercat-vue/Alert'

const showAlert1 = ref(true)
const showAlert2 = ref(true)
const showAlert3 = ref(true)

const customContentItems = [
  { key: 1, title: '支持列表项' },
  { key: 2, title: '支持多种格式' },
  { key: 3, title: '支持任意 Vue 组件' }
]

const resetClosableAlerts = () => {
  showAlert1.value = true
  showAlert2.value = true
}
</script>

<template>
  <div class="min-w-0">
    <div
      class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4 dark:border-gray-800 dark:bg-gray-900/40">
      <Alert type="info" title="信息提示" description="这是一条信息提示的详细内容" />
      <Alert type="success" title="成功提示" description="操作成功完成" />
      <Alert type="warning" title="警告提示" description="请注意相关事项" />
      <Alert type="error" title="错误提示" description="操作失败，请重试" />
    </div>
  </div>
</template>
