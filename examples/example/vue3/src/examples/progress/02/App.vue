<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Progress } from '@expcat/tigercat-vue/Progress'

const uploadProgress = ref(0)

const startUpload = () => {
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
    }
  }, 500)
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">文件上传示例</h3>
        <Space direction="vertical" class="w-full">
          <Progress :percentage="uploadProgress" aria-label="文件上传进度" />
          <Button variant="primary" @click="startUpload">开始上传</Button>
        </Space>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">仪表盘展示</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">CPU 使用率</h4>
            <Progress
              type="circle"
              :percentage="75"
              variant="primary"
              :show-text="true"
              aria-label="CPU 使用率" />
          </div>
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">内存使用率</h4>
            <Progress
              type="circle"
              :percentage="60"
              variant="success"
              :show-text="true"
              aria-label="内存使用率" />
          </div>
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">磁盘使用率</h4>
            <Progress
              type="circle"
              :percentage="85"
              status="paused"
              :show-text="true"
              aria-label="磁盘使用率" />
          </div>
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">网络带宽</h4>
            <Progress
              type="circle"
              :percentage="95"
              status="exception"
              :show-text="true"
              aria-label="网络带宽" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
