<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { notification } from '@expcat/tigercat-vue'

const closeNotification = ref<(() => void) | null>(null)

const showNotification = () => {
  closeNotification.value?.()
  closeNotification.value = notification.success({
    title: '保存成功',
    description: '个人资料已更新。'
  })
}
</script>

<template>
  <Button variant="primary" @click="showNotification">显示通知</Button>
</template>
