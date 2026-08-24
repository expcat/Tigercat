<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { LoadingBar } from '@expcat/tigercat-vue'

const simulateRequest = async () => {
  LoadingBar.start()
  await new Promise((resolve) => window.setTimeout(resolve, 1200))
  LoadingBar.finish()
}
</script>

<template>
  <Button variant="primary" @click="simulateRequest">开始加载</Button>
</template>
