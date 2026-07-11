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
    <Button @click="open1 = true">查看图片</Button
    ><ImageViewer v-model:open="open1" :images="images" />
  </div>
</template>
