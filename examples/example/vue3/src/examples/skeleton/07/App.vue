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
    <Space direction="vertical" :size="16" class="w-full">
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">自定义宽度</h3>
        <Skeleton width="200px" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">自定义高度</h3>
        <Skeleton height="50px" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">同时自定义宽高</h3>
        <Skeleton width="300px" height="100px" />
      </div>
    </Space>
  </div>
</template>
