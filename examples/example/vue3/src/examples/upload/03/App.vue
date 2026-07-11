<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@expcat/tigercat-vue/Upload'
import { type UploadFile } from '@expcat/tigercat-vue'
import type { UploadRequestOptions } from '@expcat/tigercat-core'

const fileList = ref<UploadFile[]>([])
const fileList2 = ref<UploadFile[]>([])
const fileList3 = ref<UploadFile[]>([])
const fileList4 = ref<UploadFile[]>([])
const fileList5 = ref<UploadFile[]>([])
const fileList6 = ref<UploadFile[]>([])
const fileList7 = ref<UploadFile[]>([])
const uploadFeedback = ref('尚未执行上传操作')

const handleChange = (file: UploadFile, list: UploadFile[]) => {
  uploadFeedback.value = `${file.name} 已加入上传列表，当前 ${list.length} 个文件。`
}

const handlePreview = (file: UploadFile) => {
  uploadFeedback.value = `正在预览 ${file.name}`
  if (file.url) {
    window.open(file.url, '_blank')
  }
}

const handleExceed = (_files: File[], list: UploadFile[]) => {
  uploadFeedback.value = `已拒绝超出数量限制的文件；当前已有 ${list.length} 个，最多 3 个。`
}

const beforeUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    uploadFeedback.value = `已拒绝 ${file.name}：只能上传 JPG/PNG 格式的图片。`
    return false
  }
  if (!isLt2M) {
    uploadFeedback.value = `已拒绝 ${file.name}：图片大小不能超过 2MB。`
    return false
  }
  uploadFeedback.value = `${file.name} 校验通过，等待上传。`
  return true
}

const simulateUpload = (options: UploadRequestOptions) => {
  let progress = 0
  const timer = setInterval(() => {
    progress += 20
    options.onProgress?.(progress)
    uploadFeedback.value = `正在上传 ${options.file.name}：${progress}%`
    if (progress >= 100) {
      clearInterval(timer)
      options.onSuccess?.({ name: options.file.name })
      uploadFeedback.value = `${options.file.name} 上传完成`
    }
  }, 500)
}
</script>

<template>
  <div class="min-w-0">
    <div class="max-w-md">
      <Upload v-model:file-list="fileList3" multiple> 选择多个文件 </Upload>
    </div>
  </div>
</template>
