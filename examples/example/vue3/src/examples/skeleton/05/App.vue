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
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">段落模式</h3>
        <Skeleton variant="text" :rows="4" paragraph />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">普通模式</h3>
        <Skeleton variant="text" :rows="4" />
      </div>
    </Space>
  </div>
</template>
