<script setup lang="ts">
import { ref } from 'vue'
import { ImageAnnotation } from '@expcat/tigercat-vue/ImageAnnotation'
import type { ImageAnnotation as Annotation, ImageAnnotationTool } from '@expcat/tigercat-core'

const tools: ImageAnnotationTool[] = ['select', 'rectangle', 'ellipse', 'polygon', 'freehand']

const annotations = ref<Annotation[]>([
  {
    id: 'entrance',
    type: 'rectangle',
    x: 0.1,
    y: 0.18,
    width: 0.24,
    height: 0.28,
    label: '入口',
    color: '#2563eb'
  },
  {
    id: 'work-area',
    type: 'ellipse',
    x: 0.56,
    y: 0.26,
    width: 0.25,
    height: 0.3,
    label: '工作区',
    color: '#16a34a'
  }
])
const tool = ref<ImageAnnotationTool>('select')
const selectedId = ref('entrance')
const readOnly = ref(false)

const handleToolControl = (event: Event) => {
  tool.value = (event.target as HTMLSelectElement).value as ImageAnnotationTool
}

const handleSelectionControl = (event: Event) => {
  selectedId.value = (event.target as HTMLSelectElement).value
}

const handleToolChange = (nextTool: ImageAnnotationTool) => {
  tool.value = nextTool
}

const handleSelect = (annotation: Annotation | null) => {
  selectedId.value = annotation?.id ?? ''
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <label class="grid gap-1 text-sm">
        <span>受控工具</span>
        <select
          class="rounded border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900"
          :value="tool"
          :disabled="readOnly"
          @change="handleToolControl">
          <option v-for="item in tools" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label class="grid gap-1 text-sm">
        <span>受控选区</span>
        <select
          class="rounded border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900"
          :value="selectedId"
          @change="handleSelectionControl">
          <option value="">无</option>
          <option v-for="annotation in annotations" :key="annotation.id" :value="annotation.id">
            {{ annotation.label ?? annotation.id }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-2 pb-1.5 text-sm">
        <input v-model="readOnly" type="checkbox" />
        只读模式
      </label>
    </div>

    <ImageAnnotation
      v-model="annotations"
      src="https://picsum.photos/seed/annotation-controlled/900/600"
      :tool="tool"
      :selected-id="selectedId"
      :readonly="readOnly"
      :tools="tools"
      @tool-change="handleToolChange"
      @select="handleSelect" />

    <p class="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
      当前工具：{{ tool }}；当前选区：{{ selectedId || '无' }}；{{ readOnly ? '只读' : '可编辑' }}。
    </p>
  </div>
</template>
