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
      <Alert
        type="success"
        title="操作成功"
        description="您的订单已成功提交，我们将尽快为您处理。订单号：202312310001" />
      <Alert
        type="warning"
        title="注意事项"
        description="请确保填写的信息准确无误，操作过程中请勿关闭页面。" />
      <Alert
        type="error"
        title="操作失败"
        description="网络连接失败，请检查您的网络设置后重试。错误代码：E001" />
    </div>
  </div>
</template>
