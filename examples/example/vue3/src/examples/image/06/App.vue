<script setup lang="ts">
import { ref } from 'vue'
import { Image } from '@expcat/tigercat-vue/Image'
import { ImageGroup } from '@expcat/tigercat-vue/ImageGroup'

const open = ref(false)
const index = ref(0)
</script>

<template>
  <ImageGroup v-model:open="open" v-model:current-index="index">
    <Image src="https://picsum.photos/seed/group-a/240/160" alt="甲" />
    <Image
      src="https://picsum.photos/seed/group-missing/240/160"
      fallback-src="https://picsum.photos/seed/group-b/240/160"
      alt="乙" />
  </ImageGroup>
</template>
