<script setup lang="ts">
import { ref } from 'vue'
import { ImageAnnotation } from '@expcat/tigercat-vue/ImageAnnotation'
import type { ImageAnnotation as Annotation } from '@expcat/tigercat-core'

const annotations = ref<Annotation[]>([
  {
    id: 'region-1',
    type: 'rectangle',
    x: 0.12,
    y: 0.18,
    width: 0.22,
    height: 0.2,
    label: '入口',
    color: '#2563eb'
  }
])
</script>

<template>
  <ImageAnnotation
    v-model="annotations"
    src="https://picsum.photos/seed/annotation/900/600"
    :tools="['select', 'rectangle', 'ellipse', 'polygon', 'freehand']"
    default-tool="rectangle" />
</template>
