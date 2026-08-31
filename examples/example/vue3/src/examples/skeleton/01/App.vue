<script setup lang="ts">
import { Skeleton } from '@expcat/tigercat-vue/Skeleton'
</script>

<template>
  <div class="space-y-6">
    <Skeleton variant="text" :rows="3" paragraph animation="wave" />
    <div class="flex items-center gap-3">
      <Skeleton variant="avatar" shape="circle" />
      <div class="flex-1">
        <Skeleton variant="text" />
      </div>
    </div>
    <Skeleton variant="image" />
    <Skeleton variant="button" />
  </div>
</template>
