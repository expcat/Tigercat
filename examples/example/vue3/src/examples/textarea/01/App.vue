<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@expcat/tigercat-vue/Textarea'

const value = ref('')
</script>

<template>
  <Textarea v-model="value" :rows="4" size="lg" placeholder="请输入说明" class="w-full max-w-lg" />
</template>
