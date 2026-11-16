<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@expcat/tigercat-vue/Rate'

const mood = ref(4)
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <span class="w-16 text-sm text-gray-500">自定义</span>
      <Rate v-model="mood" character="♥" allow-clear aria-label="自定义评分" />
    </div>
    <p class="text-sm text-gray-500">
      character 渲染文本或 emoji；allowClear 时再次点击当前值可清零。
    </p>
    <div class="flex items-center gap-3">
      <span class="w-16 text-sm text-gray-500">只读</span>
      <Rate :model-value="4.5" read-only allow-half aria-label="只读评分" />
    </div>
    <div class="flex items-center gap-3">
      <span class="w-16 text-sm text-gray-500">禁用</span>
      <Rate :model-value="2" disabled aria-label="禁用评分" />
    </div>
  </div>
</template>
