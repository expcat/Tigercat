<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Progress } from '@expcat/tigercat-vue/Progress'

const percentage = ref(0)
let timer: number | null = null

const startUpload = () => {
  if (timer !== null) window.clearInterval(timer)
  percentage.value = 0
  timer = window.setInterval(() => {
    percentage.value = Math.min(percentage.value + 10, 100)
    if (percentage.value === 100 && timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }, 200)
}

onBeforeUnmount(() => {
  if (timer !== null) window.clearInterval(timer)
})
</script>

<template>
  <div class="space-y-3">
    <Progress :percentage="percentage" />
    <Progress :percentage="40" status="paused" striped striped-animation />
    <Button @click="startUpload">开始上传</Button>
  </div>
</template>
