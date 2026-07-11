<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Progress } from '@expcat/tigercat-vue/Progress'

const percentage = ref(0)

const startUpload = () => {
  percentage.value = 0
  const timer = window.setInterval(() => {
    percentage.value = Math.min(percentage.value + 10, 100)
    if (percentage.value === 100) window.clearInterval(timer)
  }, 200)
}
</script>

<template>
  <div class="space-y-3">
    <Progress :percentage="percentage" aria-label="文件上传进度" />
    <Button @click="startUpload">开始上传</Button>
  </div>
</template>
