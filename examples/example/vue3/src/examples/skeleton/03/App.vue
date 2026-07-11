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
        <h3 class="text-sm font-semibold text-gray-700 mb-2">脉冲 (Pulse) - 默认</h3>
        <Skeleton animation="pulse" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">波浪 (Wave)</h3>
        <Skeleton animation="wave" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">无动画 (None)</h3>
        <Skeleton animation="none" />
      </div>
    </Space>
  </div>
</template>
