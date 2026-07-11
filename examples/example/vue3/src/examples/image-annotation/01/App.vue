<script setup lang="ts">
import { ref } from 'vue'
import { ImageAnnotation } from '@expcat/tigercat-vue/ImageAnnotation'
import type { ImageAnnotation as ImageAnnotationItem } from '@expcat/tigercat-core'

const PHOTO = 'https://picsum.photos/seed/annotation/900/600'

const initialAnnotations: ImageAnnotationItem[] = [
  {
    id: 'region-1',
    type: 'rectangle',
    x: 0.12,
    y: 0.18,
    width: 0.22,
    height: 0.2,
    label: '入口',
    color: '#2563eb'
  },
  {
    id: 'region-2',
    type: 'ellipse',
    x: 0.56,
    y: 0.28,
    width: 0.18,
    height: 0.22,
    label: '目标',
    color: '#dc2626'
  }
]

const annotations = ref<ImageAnnotationItem[]>(initialAnnotations)
const selected = ref<ImageAnnotationItem | null>(null)
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">受控标注</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          通过 v-model 管理标注数据，切换工具后在图片上拖拽绘制。
        </p>
        <div class="space-y-4">
          <ImageAnnotation
            v-model="annotations"
            :src="PHOTO"
            default-tool="rectangle"
            @select="(annotation: ImageAnnotationItem | null) => (selected = annotation)" />
          <div class="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            标注数量：{{ annotations.length
            }}{{ selected ? `，当前选择：${selected.label ?? selected.id}` : '，未选择标注' }}
          </div>
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多形状工具</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          内置 select、rectangle、ellipse、polygon、freehand 工具；多边形可用双击或 Enter 完成。
        </p>
        <ImageAnnotation
          :src="PHOTO"
          :tools="['select', 'rectangle', 'ellipse', 'polygon', 'freehand']"
          :default-value="initialAnnotations" />
      </section>
    </div>
  </div>
</template>
