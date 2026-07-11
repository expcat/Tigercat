<script setup lang="ts">
import { ref } from 'vue'
import { FileManager } from '@expcat/tigercat-vue/FileManager'

const files = [
  {
    key: 'docs',
    name: 'docs',
    type: 'folder' as const,
    children: [{ key: 'guide', name: 'guide.md', type: 'file' as const, size: 1500 }]
  },
  {
    key: 'src',
    name: 'src',
    type: 'folder' as const,
    children: [{ key: 'index', name: 'index.ts', type: 'file' as const, size: 800 }]
  },
  { key: 'readme', name: 'README.md', type: 'file' as const, size: 2048 }
]

const currentPath = ref<string[]>([])
</script>

<template>
  <FileManager
    :files="files"
    view-mode="list"
    multiple
    searchable
    :current-path="currentPath"
    style="height: 360px; border: 1px solid #e5e7eb; border-radius: 8px"
    @navigate="currentPath = $event" />
</template>
