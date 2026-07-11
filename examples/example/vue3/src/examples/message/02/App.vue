<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Message } from '@expcat/tigercat-vue'

const closeMessage = ref<(() => void) | null>(null)
const active = ref(false)

const showMessage = () => {
  closeMessage.value?.()
  active.value = true
  closeMessage.value = Message.loading({
    content: '正在处理请求...',
    onClose: () => {
      active.value = false
    }
  })
}

const closeManually = () => {
  closeMessage.value?.()
  closeMessage.value = null
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button variant="primary" :disabled="active" @click="showMessage">显示加载消息</Button>
    <Button variant="secondary" :disabled="!active" @click="closeManually">手动关闭</Button>
  </div>
</template>
