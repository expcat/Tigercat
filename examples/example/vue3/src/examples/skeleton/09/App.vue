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
    <div class="bg-white p-6 rounded-lg">
      <div v-if="loading">
        <Skeleton variant="text" width="200px" class="mb-4" />
        <Skeleton variant="text" :rows="3" paragraph />
      </div>
      <div v-else>
        <h3 class="text-xl font-bold mb-4">文章标题</h3>
        <p class="text-gray-700 dark:text-gray-300">
          这是加载完成后显示的内容。骨架屏在内容加载时显示，
          提供更好的用户体验，避免页面空白或突然跳动。
        </p>
      </div>
    </div>
  </div>
</template>
