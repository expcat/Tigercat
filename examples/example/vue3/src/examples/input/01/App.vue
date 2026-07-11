<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'

const value = ref('')
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <Input v-model="value" type="search" size="lg" prefix="🔎" suffix="⌘K" placeholder="搜索组件" />
    <p class="text-sm text-gray-600 dark:text-gray-300">当前输入：{{ value || '暂无' }}</p>
  </div>
</template>
