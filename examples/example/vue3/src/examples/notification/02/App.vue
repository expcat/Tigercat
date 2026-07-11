<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { notification } from '@expcat/tigercat-vue'

const closeNotification = ref<(() => void) | null>(null)

const showNotification = () => {
  closeNotification.value?.()
  closeNotification.value = notification.warning({
    title: '会话即将过期',
    description: '请在两分钟内保存当前内容。',
    position: 'bottom-left',
    duration: 2500
  })
}
</script>

<template>
  <Button variant="primary" @click="showNotification">在左下角显示 2.5 秒</Button>
</template>
