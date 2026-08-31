<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'

const value = ref('hello')
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <Input v-model="value" show-count :max-length="20" placeholder="字数统计" />
  </div>
</template>
