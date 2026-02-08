<script setup lang="ts">
import { ref } from 'vue'
import { Upload, type UploadFile } from '@expcat/tigercat-vue'
import type { UploadRequestOptions } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const fileList = ref<UploadFile[]>([])
const fileList2 = ref<UploadFile[]>([])
const fileList3 = ref<UploadFile[]>([])
const fileList4 = ref<UploadFile[]>([])
const fileList5 = ref<UploadFile[]>([])
const fileList6 = ref<UploadFile[]>([])
const fileList7 = ref<UploadFile[]>([])

const handleChange = (file: UploadFile, list: UploadFile[]) => {
  console.log('File changed:', file, list)
}

const handlePreview = (file: UploadFile) => {
  console.log('Preview file:', file)
  if (file.url) {
    window.open(file.url, '_blank')
  }
}

const handleExceed = (_files: File[], list: UploadFile[]) => {
  alert(`最多只能上传 ${list.length} 个文件！`)
}

const beforeUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    alert('只能上传 JPG/PNG 格式的图片！')
    return false
  }
  if (!isLt2M) {
    alert('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const simulateUpload = (options: UploadRequestOptions) => {
  let progress = 0
  const timer = setInterval(() => {
    progress += 20
    options.onProgress?.(progress)
    if (progress >= 100) {
      clearInterval(timer)
      options.onSuccess?.({ url: URL.createObjectURL(options.file) })
    }
  }, 500)
}

const basicSnippet = `<div class="max-w-md space-y-4">
  <Upload v-model:file-list="fileList" @change="handleChange">
    <template #default> 选择文件 </template>
  </Upload>
</div>`

const dragSnippet = `<div class="max-w-md">
  <Upload v-model:file-list="fileList2" drag />
</div>`

const multipleSnippet = `<div class="max-w-md">
  <Upload v-model:file-list="fileList3" multiple> 选择多个文件 </Upload>
</div>`

const limitSnippet = `<div class="max-w-md">
  <Upload v-model:file-list="fileList4" multiple :limit="3" @exceed="handleExceed">
    最多上传 3 个文件
  </Upload>
</div>`

const validateSnippet = `<div class="max-w-md space-y-6">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">仅允许图片</label>
    <Upload v-model:file-list="fileList5" accept="image/*" drag />
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">自定义校验（JPG/PNG，小于2MB）</label>
    <Upload
      accept="image/jpeg,image/png"
      :max-size="2 * 1024 * 1024"
      :before-upload="beforeUpload"
      drag />
  </div>
</div>`

const pictureCardSnippet = `<div class="max-w-2xl">
  <Upload
    v-model:file-list="fileList6"
    accept="image/*"
    list-type="picture-card"
    multiple
    @preview="handlePreview" />
</div>`

const disabledSnippet = `<div class="max-w-md space-y-6">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">禁用的按钮上传</label>
    <Upload disabled> 选择文件（已禁用） </Upload>
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">禁用的拖拽上传</label>
    <Upload disabled drag />
  </div>
</div>`

const customRequestSnippet = `<div class="max-w-md">
  <Upload
    v-model:file-list="fileList7"
    :custom-request="simulateUpload"
    multiple
    drag />
</div>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Upload 文件上传</h1>
      <p class="text-gray-600">通过点击或者拖拽上传文件。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="基础的文件上传组件。"
               :code="basicSnippet">
      <div class="max-w-md space-y-4">
        <Upload v-model:file-list="fileList"
                @change="handleChange">
          <template #default> 选择文件 </template>
        </Upload>
      </div>
    </DemoBlock>

    <!-- 拖拽上传 -->
    <DemoBlock title="拖拽上传"
               description="将文件拖拽到区域内即可上传。"
               :code="dragSnippet">
      <div class="max-w-md">
        <Upload v-model:file-list="fileList2"
                drag />
      </div>
    </DemoBlock>

    <!-- 多文件上传 -->
    <DemoBlock title="多文件上传"
               description="通过设置 multiple 属性允许同时选择多个文件。"
               :code="multipleSnippet">
      <div class="max-w-md">
        <Upload v-model:file-list="fileList3"
                multiple> 选择多个文件 </Upload>
      </div>
    </DemoBlock>

    <!-- 文件数量限制 -->
    <DemoBlock title="文件数量限制"
               description="通过 limit 属性限制上传文件的数量。"
               :code="limitSnippet">
      <div class="max-w-md">
        <Upload v-model:file-list="fileList4"
                multiple
                :limit="3"
                @exceed="handleExceed">
          最多上传 3 个文件
        </Upload>
      </div>
    </DemoBlock>

    <!-- 文件类型和大小限制 -->
    <DemoBlock title="文件类型和大小限制"
               description="通过 accept 和 maxSize 限制文件类型和大小。"
               :code="validateSnippet">
      <div class="max-w-md space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">仅允许图片</label>
          <Upload v-model:file-list="fileList5"
                  accept="image/*"
                  drag />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">自定义校验（JPG/PNG，小于2MB）</label>
          <Upload accept="image/jpeg,image/png"
                  :max-size="2 * 1024 * 1024"
                  :before-upload="beforeUpload"
                  drag />
        </div>
      </div>
    </DemoBlock>

    <!-- 图片卡片列表 -->
    <DemoBlock title="图片卡片列表"
               description='使用 listType="picture-card" 显示图片卡片样式。'
               :code="pictureCardSnippet">
      <div class="max-w-2xl">
        <Upload v-model:file-list="fileList6"
                accept="image/*"
                list-type="picture-card"
                multiple
                @preview="handlePreview" />
      </div>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态"
               description="设置 disabled 属性禁用上传功能。"
               :code="disabledSnippet">
      <div class="max-w-md space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">禁用的按钮上传</label>
          <Upload disabled> 选择文件（已禁用） </Upload>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">禁用的拖拽上传</label>
          <Upload disabled
                  drag />
        </div>
      </div>
    </DemoBlock>

    <!-- 自定义上传 -->
    <DemoBlock title="自定义上传"
               description="通过 customRequest 实现自定义上传逻辑，可观察上传进度。"
               :code="customRequestSnippet">
      <div class="max-w-md">
        <Upload v-model:file-list="fileList7"
                :custom-request="simulateUpload"
                multiple
                drag />
      </div>
    </DemoBlock>
  </div>
</template>
