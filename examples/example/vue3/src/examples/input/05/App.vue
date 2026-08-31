<script setup lang="ts">
import { Input } from '@expcat/tigercat-vue/Input'
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <Input model-value="禁用" disabled />
    <Input model-value="只读" readonly />
  </div>
</template>
