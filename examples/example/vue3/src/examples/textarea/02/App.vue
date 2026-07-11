<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@expcat/tigercat-vue/Textarea'

const value = ref('')
</script>

<template>
  <Textarea
    v-model="value"
    auto-resize
    :min-rows="2"
    :max-rows="6"
    show-count
    :max-length="120"
    placeholder="自动扩展，并显示字符计数"
    class="w-full max-w-lg" />
</template>
