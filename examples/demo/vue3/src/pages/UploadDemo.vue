<script setup lang="ts">
import { ref } from 'vue'
import { Upload, type UploadFile } from '@tigercat/vue'

const fileList = ref<UploadFile[]>([])
const fileList2 = ref<UploadFile[]>([])
const fileList3 = ref<UploadFile[]>([])
const fileList4 = ref<UploadFile[]>([])
const fileList5 = ref<UploadFile[]>([])
const fileList6 = ref<UploadFile[]>([])

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
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Upload 文件上传</h1>
      <p class="text-gray-600">通过点击或者拖拽上传文件。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的文件上传组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-4">
          <Upload 
            v-model:file-list="fileList"
            @change="handleChange"
          >
            <template #default>
              选择文件
            </template>
          </Upload>
        </div>
      </div>
    </section>

    <!-- 拖拽上传 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">拖拽上传</h2>
      <p class="text-gray-600 mb-6">将文件拖拽到区域内即可上传。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md">
          <Upload 
            v-model:file-list="fileList2"
            drag
          />
        </div>
      </div>
    </section>

    <!-- 多文件上传 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多文件上传</h2>
      <p class="text-gray-600 mb-6">通过设置 multiple 属性允许同时选择多个文件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md">
          <Upload 
            v-model:file-list="fileList3"
            multiple
          >
            选择多个文件
          </Upload>
        </div>
      </div>
    </section>

    <!-- 文件数量限制 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文件数量限制</h2>
      <p class="text-gray-600 mb-6">通过 limit 属性限制上传文件的数量。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md">
          <Upload 
            v-model:file-list="fileList4"
            multiple
            :limit="3"
            @exceed="handleExceed"
          >
            最多上传 3 个文件
          </Upload>
        </div>
      </div>
    </section>

    <!-- 文件类型和大小限制 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文件类型和大小限制</h2>
      <p class="text-gray-600 mb-6">通过 accept 和 maxSize 限制文件类型和大小。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">仅允许图片</label>
            <Upload 
              v-model:file-list="fileList5"
              accept="image/*"
              drag
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">自定义校验（JPG/PNG，小于2MB）</label>
            <Upload 
              accept="image/jpeg,image/png"
              :max-size="2 * 1024 * 1024"
              :before-upload="beforeUpload"
              drag
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 图片卡片列表 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">图片卡片列表</h2>
      <p class="text-gray-600 mb-6">使用 listType="picture-card" 显示图片卡片样式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-2xl">
          <Upload 
            v-model:file-list="fileList6"
            accept="image/*"
            list-type="picture-card"
            multiple
            @preview="handlePreview"
          />
        </div>
      </div>
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">设置 disabled 属性禁用上传功能。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">禁用的按钮上传</label>
            <Upload disabled>
              选择文件（已禁用）
            </Upload>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">禁用的拖拽上传</label>
            <Upload disabled drag />
          </div>
        </div>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
