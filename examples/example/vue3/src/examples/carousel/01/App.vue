<script setup lang="ts">
import { Carousel } from '@expcat/tigercat-vue/Carousel'

const slides = ['Slide 1 · 产品概览', 'Slide 2 · 关键能力', 'Slide 3 · 立即开始']
</script>

<template>
  <Carousel autoplay :autoplay-speed="4000" arrows effect="fade" pause-on-hover>
    <div
      v-for="slide in slides"
      :key="slide"
      class="flex h-48 items-center justify-center rounded-lg bg-blue-600 text-xl font-semibold text-white">
      {{ slide }}
    </div>
  </Carousel>
</template>
