<script setup lang="ts">
import { ref } from 'vue'
import { InputOTP } from '@expcat/tigercat-vue/InputOTP'

const value = ref('')
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <InputOTP v-model="value" type="alphanumeric" masked :groups="[3, 3]" separator="-" />
    <p class="text-sm text-gray-600 dark:text-gray-300">
      掩码模式 + 字母数字 + 3-3 分组，真实值：{{ value || '暂无' }}
    </p>
  </div>
</template>
