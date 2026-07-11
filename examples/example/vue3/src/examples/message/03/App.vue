<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Message } from '@expcat/tigercat-vue'

const closeMessage = ref<(() => void) | null>(null)
const running = ref(false)

const submit = async () => {
  closeMessage.value?.()
  running.value = true

  const closeLoading = Message.loading('正在提交...')
  closeMessage.value = closeLoading
  await new Promise((resolve) => window.setTimeout(resolve, 1200))

  closeLoading()
  closeMessage.value = Message.success('提交成功')
  running.value = false
}
</script>

<template>
  <Button variant="primary" :loading="running" :disabled="running" @click="submit">
    提交表单
  </Button>
</template>
