<script setup lang="ts">
import { Image } from '@expcat/tigercat-vue/Image'

const photo = 'https://picsum.photos/seed/tiger-basic/600/400'
</script>

<template>
  <Image :src="photo" alt="山间风景" :width="240" :height="150" fit="cover" :preview="false" />
</template>
