<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { LoadingBar } from '@expcat/tigercat-vue'

const simulateError = async () => {
  LoadingBar.start()
  await new Promise((resolve) => window.setTimeout(resolve, 800))
  LoadingBar.error()
}
</script>

<template>
  <Button variant="danger" @click="simulateError">模拟失败</Button>
</template>
