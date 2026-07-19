<script setup lang="ts">
import { ref } from 'vue'
import { InputOTP } from '@expcat/tigercat-vue/InputOTP'

const value = ref('')
const done = ref('')
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <InputOTP v-model="value" :length="6" @complete="(code: string) => (done = code)" />
    <p class="text-sm text-gray-600 dark:text-gray-300">当前输入：{{ value || '暂无' }}</p>
    <p v-if="done" class="text-sm text-green-600 dark:text-green-400">已完成：{{ done }}</p>
  </div>
</template>
