<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">列表视图</h3>
      <div style="height: 320px; border: 1px solid #e5e7eb; border-radius: 8px">
        <FileManager :files="files" view-mode="list" searchable />
      </div>
    </section>
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多选 & 面包屑导航</h3>
      <div style="height: 320px; border: 1px solid #e5e7eb; border-radius: 8px">
        <FileManager
          :files="nestedFiles"
          view-mode="list"
          multiple
          searchable
          :current-path="currentPath"
          @navigate="currentPath = $event" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileManager } from '@expcat/tigercat-vue/FileManager'

const currentPath = ref<string[]>([])

const files = [
  { key: '1', name: 'README.md', type: 'file' as const, size: 2048, modified: '2024-01-15' },
  { key: '2', name: 'src', type: 'folder' as const, modified: '2024-01-14' },
  { key: '3', name: 'package.json', type: 'file' as const, size: 512, modified: '2024-01-10' },
  { key: '4', name: 'dist', type: 'folder' as const, modified: '2024-01-13' }
]

const nestedFiles = [
  {
    key: '1',
    name: 'docs',
    type: 'folder' as const,
    children: [
      { key: '1-1', name: 'guide.md', type: 'file' as const, size: 1500 },
      { key: '1-2', name: 'api.md', type: 'file' as const, size: 3200 }
    ]
  },
  { key: '2', name: 'README.md', type: 'file' as const, size: 2048 }
]
</script>
