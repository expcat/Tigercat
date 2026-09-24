<script setup lang="ts">
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue/Steps'

const current = ref(1)
</script>

<template>
  <Steps v-model:current="current" progress-dot clickable status="error">
    <StepsItem title="起草" />
    <StepsItem title="校验" />
    <StepsItem title="发布" />
  </Steps>
</template>
