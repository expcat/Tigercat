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
    <Space direction="vertical" :size="24" class="w-full">
      <div class="bg-white p-4 rounded-lg">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">文章预览</h3>
        <div class="flex items-start gap-4">
          <Skeleton variant="avatar" shape="circle" />
          <div class="flex-1">
            <Skeleton variant="text" width="150px" class="mb-2" />
            <Skeleton variant="text" :rows="2" paragraph />
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">图片卡片</h3>
        <Skeleton variant="image" class="mb-4" />
        <Skeleton variant="text" :rows="2" paragraph class="mb-3" />
        <Skeleton variant="button" />
      </div>
    </Space>
  </div>
</template>
