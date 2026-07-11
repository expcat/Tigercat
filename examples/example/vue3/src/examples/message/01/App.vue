<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Message } from '@expcat/tigercat-vue'

const closeMessage = ref<(() => void) | null>(null)

const showMessage = () => {
  closeMessage.value?.()
  closeMessage.value = Message.success('保存成功')
}
</script>

<template>
  <Button variant="primary" @click="showMessage">显示消息</Button>
</template>
