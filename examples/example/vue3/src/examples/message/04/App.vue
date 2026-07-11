<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Message } from '@expcat/tigercat-vue'

const starIcon =
  'M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.85l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z'
const closeMessage = ref<(() => void) | null>(null)
const status = ref('尚未显示消息')

const showMessage = () => {
  closeMessage.value?.()
  status.value = '等待消息关闭'
  closeMessage.value = Message.info({
    content: '已收藏当前页面',
    icon: starIcon,
    className: 'shadow-xl',
    closable: true,
    onClose: () => {
      status.value = '消息已关闭'
    }
  })
}
</script>

<template>
  <div class="space-y-3">
    <Button variant="primary" @click="showMessage">显示自定义消息</Button>
    <p class="text-sm text-gray-500" role="status">{{ status }}</p>
  </div>
</template>
