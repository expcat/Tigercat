<script setup lang="ts">
import { ref } from 'vue'
import { FileManager } from '@expcat/tigercat-vue/FileManager'
import type { FileItem } from '@expcat/tigercat-core'

const files = ref<FileItem[]>([
  { key: 'design', name: 'design.fig', type: 'file', extension: 'fig', size: 3_200_000 },
  { key: 'brief', name: 'brief.md', type: 'file', extension: 'md', size: 4_800 },
  { key: 'cover', name: 'cover.png', type: 'file', extension: 'png', size: 860_000 },
  { key: 'notes', name: 'notes.txt', type: 'file', extension: 'txt', size: 2_100 },
  { key: 'archive', name: 'archive.zip', type: 'file', extension: 'zip', size: 8_400_000 }
])
const selectedKeys = ref<Array<string | number>>([])
const searchText = ref('')
const activity = ref('选择、搜索、新建或删除文件以查看受控状态变化。')
let nextFileId = 1

const addFile = () => {
  const id = nextFileId++
  files.value = [
    ...files.value,
    { key: `draft-${id}`, name: `draft-${id}.md`, type: 'file', extension: 'md', size: 0 }
  ]
  activity.value = `已新建 draft-${id}.md`
}

const removeSelectedFiles = () => {
  files.value = files.value.filter((item) => !selectedKeys.value.includes(item.key))
  activity.value = `已删除 ${selectedKeys.value.length} 个文件`
  selectedKeys.value = []
}

const handleSelection = (keys: Array<string | number>) => {
  selectedKeys.value = keys
  activity.value = `已选择 ${keys.length} 个文件`
}

const handleSearch = (text: string) => {
  searchText.value = text
  activity.value = text ? `正在筛选“${text}”` : '已清除筛选'
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
        @click="addFile">
        新建文件
      </button>
      <button
        type="button"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
        :disabled="selectedKeys.length === 0"
        @click="removeSelectedFiles">
        删除选中
      </button>
    </div>
    <div class="h-96 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <FileManager
        v-model:files="files"
        :selected-keys="selectedKeys"
        :search-text="searchText"
        view-mode="grid"
        multiple
        searchable
        @update:selected-keys="handleSelection"
        @update:search-text="handleSearch"
        @open="activity = `打开文件：${$event.name}`" />
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
      {{ activity }}
    </p>
  </div>
</template>
