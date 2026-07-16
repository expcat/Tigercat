<script setup lang="ts">
import { ref } from 'vue'
import { Alert } from '@expcat/tigercat-vue/Alert'
import { Button } from '@expcat/tigercat-vue/Button'

const show = ref(true)
</script>

<template>
  <div class="space-y-3">
    <Alert type="warning" banner title="banner 横幅：撑满宽度、无圆角，常用于页面顶部通知。" show-icon />
    <Alert
      v-if="show"
      type="info"
      title="5 秒后自动关闭"
      description="duration + showCountdown 显示倒计时进度条。"
      closable
      :duration="5000"
      show-countdown
      @close="show = false" />
    <Button v-else size="sm" @click="show = true">重新显示倒计时提示</Button>
  </div>
</template>
