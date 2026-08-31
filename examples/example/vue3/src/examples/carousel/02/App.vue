<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Carousel, type CarouselMethods } from '@expcat/tigercat-vue/Carousel'

const carouselRef = ref<CarouselMethods>()
</script>

<template>
  <div class="space-y-6">
    <Carousel autoplay :autoplay-speed="4000" arrows effect="fade" pause-on-hover pause-on-focus>
      <div class="flex h-32 items-center justify-center rounded-lg bg-violet-600 text-white">
        矮页
      </div>
      <div
        class="flex h-56 items-center justify-center rounded-lg bg-violet-700 text-xl text-white">
        高页 · 高度跟当前张
      </div>
      <div class="flex h-40 items-center justify-center rounded-lg bg-violet-800 text-white">
        中页
      </div>
    </Carousel>
    <div class="space-y-3">
      <Carousel ref="carouselRef" :infinite="false" arrows>
        <div
          v-for="slide in ['第一页', '第二页', '第三页']"
          :key="slide"
          class="flex h-36 items-center justify-center rounded-lg bg-purple-600 text-white">
          {{ slide }}
        </div>
      </Carousel>
      <div class="flex gap-2">
        <Button size="sm" @click="carouselRef?.prev()">上一页</Button>
        <Button size="sm" @click="carouselRef?.next()">下一页</Button>
        <Button size="sm" variant="secondary" @click="carouselRef?.goTo(0)">回到第一页</Button>
      </div>
    </div>
  </div>
</template>
