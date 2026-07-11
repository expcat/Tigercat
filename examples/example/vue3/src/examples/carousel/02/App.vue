<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Carousel } from '@expcat/tigercat-vue/Carousel'

const carouselRef = ref<{ next: () => void; prev: () => void; goTo: (index: number) => void }>()
const slides = ['第一页', '第二页', '第三页']
</script>

<template>
  <div class="space-y-3">
    <Carousel ref="carouselRef">
      <div
        v-for="slide in slides"
        :key="slide"
        class="flex h-40 items-center justify-center rounded-lg bg-purple-600 text-white">
        {{ slide }}
      </div>
    </Carousel>
    <div class="flex gap-2">
      <Button size="sm" @click="carouselRef?.prev()">上一页</Button>
      <Button size="sm" @click="carouselRef?.next()">下一页</Button>
      <Button size="sm" variant="secondary" @click="carouselRef?.goTo(0)">回到第一页</Button>
    </div>
  </div>
</template>
