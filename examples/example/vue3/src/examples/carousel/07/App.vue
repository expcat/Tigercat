<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Carousel } from '@expcat/tigercat-vue/Carousel'

const dotPosition = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')
const carouselRef = ref<{ next: () => void; prev: () => void; goTo: (index: number) => void }>()

const slideColors = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-green-500 to-green-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-orange-500 to-orange-600'
]
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Carousel ref="carouselRef">
        <div
          v-for="(color, index) in slideColors"
          :key="index"
          :class="[
            color,
            'h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg'
          ]">
          Slide {{ index + 1 }}
        </div>
      </Carousel>
      <div class="mt-4">
        <Space>
          <Button size="sm" @click="carouselRef?.prev()">Prev</Button>
          <Button size="sm" @click="carouselRef?.next()">Next</Button>
          <Button size="sm" @click="carouselRef?.goTo(0)">Go to First</Button>
        </Space>
      </div>
    </div>
  </div>
</template>
