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
    <div class="space-y-6">
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">文本 (Text)</h3>
        <Skeleton variant="text" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">头像 (Avatar)</h3>
        <Skeleton variant="avatar" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">图片 (Image)</h3>
        <Skeleton variant="image" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">按钮 (Button)</h3>
        <Skeleton variant="button" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">自定义 (Custom)</h3>
        <Skeleton variant="custom" width="300px" height="150px" />
      </div>
    </div>
  </div>
</template>
