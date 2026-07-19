<script setup lang="ts">
import { InputOTP } from '@expcat/tigercat-vue/InputOTP'
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <InputOTP :length="4" size="sm" default-value="12" />
    <InputOTP :length="4" size="md" status="error" error-message="验证码错误" default-value="99" />
    <InputOTP :length="4" size="lg" disabled default-value="1234" />
  </div>
</template>
