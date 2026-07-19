<script setup lang="ts">
import { MaskInput } from '@expcat/tigercat-vue/MaskInput'
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <MaskInput mask="###-##-####" size="sm" default-value="123456789" clearable />
    <MaskInput
      mask="##/##/####"
      size="md"
      status="error"
      error-message="日期无效"
      default-value="1301"
    />
    <MaskInput mask="****-****" size="lg" default-value="ab12" clearable />
  </div>
</template>
