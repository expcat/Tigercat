<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@expcat/tigercat-vue/Textarea'

const value = ref('这段说明太长了，超过上限')
</script>

<template>
  <Textarea
    v-model="value"
    status="error"
    error-message="请缩短说明"
    show-count
    :max-length="12"
    :rows="4"
    class="w-full max-w-lg" />
</template>
