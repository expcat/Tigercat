<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'

const value = ref('secret')
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <Input v-model="value" type="password" show-password clearable placeholder="密码" />
  </div>
</template>
