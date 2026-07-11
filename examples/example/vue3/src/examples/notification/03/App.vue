<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { notification } from '@expcat/tigercat-vue'

const closeNotification = ref<(() => void) | null>(null)
const active = ref(false)

const showNotification = () => {
  closeNotification.value?.()
  active.value = true
  closeNotification.value = notification.info({
    title: '后台任务运行中',
    description: '任务结束后可手动关闭这条通知。',
    duration: 0,
    onClose: () => {
      active.value = false
    }
  })
}

const closeManually = () => {
  closeNotification.value?.()
  closeNotification.value = null
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button variant="primary" :disabled="active" @click="showNotification">显示常驻通知</Button>
    <Button variant="secondary" :disabled="!active" @click="closeManually">手动关闭</Button>
  </div>
</template>
