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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-lg font-semibold mb-3">表单提交成功</h3>
        <div
          class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <Alert
            type="success"
            title="提交成功"
            description="您的申请已成功提交，我们会在 3 个工作日内进行审核。"
            closable />
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-3">系统维护通知</h3>
        <div
          class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <Alert
            type="warning"
            title="系统维护通知"
            description="系统将于今晚 23:00 - 次日 01:00 进行维护升级，期间部分功能可能无法使用，请提前做好相关准备。"
            show-icon />
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-3">错误提示</h3>
        <div
          class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <Alert
            type="error"
            title="操作失败"
            description="文件上传失败，文件大小超过限制（最大 10MB）。请重新选择文件后再试。"
            closable />
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-3">信息提示</h3>
        <div
          class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <Alert
            type="info"
            title="温馨提示"
            description="为了保护您的账号安全，建议您定期修改密码，并开启双因素认证。"
            show-icon />
        </div>
      </div>
    </div>
  </div>
</template>
