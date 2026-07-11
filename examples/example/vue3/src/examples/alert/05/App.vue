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
        v-if="showAlert1"
        type="info"
        title="可关闭的提示"
        description="点击右侧关闭按钮可以关闭此提示"
        closable
        close-aria-label="关闭提示"
        @close="showAlert1 = false" />
      <Alert
        v-if="showAlert2"
        type="success"
        title="操作成功"
        description="您的操作已成功完成"
        closable
        close-aria-label="关闭提示"
        @close="showAlert2 = false" />
      <div
        v-if="!showAlert1 || !showAlert2"
        class="text-gray-500 dark:text-gray-400 text-center py-4">
        提示已关闭
        <Button class="ml-4" size="sm" variant="primary" @click="resetClosableAlerts">
          重置
        </Button>
      </div>
    </div>
  </div>
</template>
