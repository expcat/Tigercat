<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Card } from '@expcat/tigercat-vue/Card'
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { ref, onMounted } from 'vue'
import { Skeleton } from '@expcat/tigercat-vue/Skeleton'

// Loading state simulation
const loading = ref(true)
const cardLoading = ref(true)

onMounted(() => {
  // Simulate data loading for basic demo
  setTimeout(() => {
    loading.value = false
  }, 3000)

  // Simulate data loading for card demo
  setTimeout(() => {
    cardLoading.value = false
  }, 3500)
})
</script>

<template>
  <div class="min-w-0">
    <Space>
      <div class="text-center">
        <Skeleton variant="avatar" shape="circle" />
        <p class="text-sm text-gray-600 mt-2">圆形</p>
      </div>
      <div class="text-center">
        <Skeleton variant="avatar" shape="square" />
        <p class="text-sm text-gray-600 mt-2">方形</p>
      </div>
    </Space>
  </div>
</template>
