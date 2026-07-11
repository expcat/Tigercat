<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'

const open1 = ref(false)
const open2 = ref(false)

const images = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4'
]
</script>

<template>
  <div class="min-w-0">
    <Button @click="open2 = true">打开查看器（第2张）</Button
    ><ImageViewer
      v-model:open="open2"
      :images="images"
      :current-index="1"
      :zoomable="true"
      :rotatable="true"
      :show-nav="true"
      :show-counter="true" />
  </div>
</template>
