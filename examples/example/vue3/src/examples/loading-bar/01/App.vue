<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { LoadingBar } from '@expcat/tigercat-vue'
import { LoadingBarContainer } from '@expcat/tigercat-vue/LoadingBarContainer'

const simulateRequest = async () => {
  LoadingBar.start()
  await new Promise((resolve) => window.setTimeout(resolve, 1200))
  LoadingBar.finish()
}
</script>

<template>
  <div class="space-y-3">
    <Button variant="primary" @click="simulateRequest">开始加载</Button>
    <LoadingBarContainer :percentage="42" status="loading" />
  </div>
</template>
