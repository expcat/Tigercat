<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">FileManager 文件管理器</h1>
    <p class="text-gray-500 mb-8">文件浏览管理组件，支持列表/网格视图和搜索。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示列表视图、网格视图、多选 & 面包屑导航，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">列表视图</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">默认列表模式，支持排序和搜索</p>
          <FileManager
            :files="files"
            view-mode="list"
            searchable
            style="height: 350px; border: 1px solid #e5e7eb; border-radius: 8px" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">网格视图</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">viewMode='grid'</p>
          <FileManager
            :files="files"
            view-mode="grid"
            style="height: 350px; border: 1px solid #e5e7eb; border-radius: 8px" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多选 & 面包屑导航</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">multiple 多选，currentPath 面包屑</p>
          <FileManager
            :files="nestedFiles"
            view-mode="list"
            multiple
            searchable
            :current-path="currentPath"
            @navigate="onNavigate"
            style="height: 350px; border: 1px solid #e5e7eb; border-radius: 8px" />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileManager } from '@expcat/tigercat-vue/FileManager'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './FileManagerDemo.fixture.vue?raw'

const files = [
  { key: '1', name: 'README.md', type: 'file' as const, size: 2048, modified: '2024-01-15' },
  { key: '2', name: 'src', type: 'folder' as const, modified: '2024-01-14' },
  { key: '3', name: 'package.json', type: 'file' as const, size: 512, modified: '2024-01-10' },
  { key: '4', name: 'dist', type: 'folder' as const, modified: '2024-01-13' },
  { key: '5', name: 'index.ts', type: 'file' as const, size: 1024, modified: '2024-01-12' }
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
  {
    key: '2',
    name: 'src',
    type: 'folder' as const,
    children: [{ key: '2-1', name: 'index.ts', type: 'file' as const, size: 800 }]
  },
  { key: '3', name: 'README.md', type: 'file' as const, size: 2048 }
]

const currentPath = ref<string[]>([])

const onNavigate = (path: string[]) => {
  currentPath.value = path
}
</script>
