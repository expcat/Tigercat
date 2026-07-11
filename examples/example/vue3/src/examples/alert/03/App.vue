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
      <Alert size="sm" type="info" title="小尺寸提示" description="这是小尺寸的提示内容" />
      <Alert size="md" type="success" title="中等尺寸提示" description="这是中等尺寸的提示内容" />
      <Alert size="lg" type="warning" title="大尺寸提示" description="这是大尺寸的提示内容" />
    </div>
  </div>
</template>
