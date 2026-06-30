<script setup lang="ts">
import { ref } from 'vue'
import { ImageAnnotation } from '@expcat/tigercat-vue/ImageAnnotation'
import type { ImageAnnotation as ImageAnnotationItem } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './ImageAnnotationDemo.vue?raw'

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

const controlledSnippet = `const annotations = ref<ImageAnnotation[]>(initialAnnotations)

<ImageAnnotation
  v-model="annotations"
  :src="photo"
  default-tool="rectangle" />`

const shapeSnippet = `<ImageAnnotation
  :src="photo"
  :tools="['select', 'rectangle', 'ellipse', 'polygon', 'freehand']"
  :default-value="initialAnnotations" />`
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">ImageAnnotation 图片标注</h1>
    <p class="text-gray-600 mb-8">
      用 SVG 覆层在图片上绘制矩形、圆形、多边形和自由画笔标注，坐标以归一化数据保存。
    </p>

    <DemoBlock
      title="受控标注"
      description="通过 v-model 管理标注数据，切换工具后在图片上拖拽绘制。"
      :code="fullPageSnippet">
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
    </DemoBlock>

    <DemoBlock
      title="多形状工具"
      description="内置 select、rectangle、ellipse、polygon、freehand 工具；多边形可用双击或 Enter 完成。"
      :code="fullPageSnippet">
      <ImageAnnotation
        :src="PHOTO"
        :tools="['select', 'rectangle', 'ellipse', 'polygon', 'freehand']"
        :default-value="initialAnnotations" />
    </DemoBlock>
  </div>
</template>
