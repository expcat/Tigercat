<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Skeleton } from '@expcat/tigercat-vue/Skeleton'

const loading = ref(true)
</script>

<template>
  <div class="space-y-4">
    <Button size="sm" @click="loading = !loading">切换加载状态</Button>
    <Skeleton v-if="loading" variant="text" :rows="2" paragraph />
    <p v-else>内容加载完成。</p>
  </div>
</template>
