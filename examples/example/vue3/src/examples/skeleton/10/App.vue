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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <template v-if="cardLoading">
        <Card v-for="i in 4" :key="i">
          <div class="flex items-start gap-4">
            <Skeleton variant="avatar" shape="square" />
            <div class="flex-1">
              <Skeleton variant="text" width="120px" class="mb-2" />
              <Skeleton variant="text" :rows="2" paragraph />
            </div>
          </div>
        </Card>
      </template>
      <template v-else>
        <Card v-for="i in 4" :key="i">
          <div class="flex items-start gap-4">
            <Avatar shape="square" text="项" />
            <div class="flex-1">
              <h4 class="font-semibold mb-1">内容项 {{ i }}</h4>
              <p class="text-sm text-gray-600">这是骨架屏加载完成后显示的内容。</p>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </div>
</template>
