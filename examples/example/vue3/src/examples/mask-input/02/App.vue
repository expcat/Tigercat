<script setup lang="ts">
import { ref } from 'vue'
import { MaskInput } from '@expcat/tigercat-vue/MaskInput'
import type { MaskToken } from '@expcat/tigercat-core'

const plate = ref('')
const tokens: Record<string, MaskToken> = {
  A: { pattern: /[A-Za-z]/, transform: (c) => c.toUpperCase() }
}
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <MaskInput v-model="plate" mask="AA-####" :tokens="tokens" placeholder="AB-1234" />
    <p class="text-sm text-gray-600 dark:text-gray-300">
      自定义 token(字母自动大写),原始值：{{ plate || '暂无' }}
    </p>
  </div>
</template>
