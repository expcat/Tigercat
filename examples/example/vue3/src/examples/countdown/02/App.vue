<script setup lang="ts">
import { Countdown } from '@expcat/tigercat-vue/Countdown'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Card } from '@expcat/tigercat-vue/Card'

const now = Date.now()
const status = ref('等待付款')
</script>

<template>
  <div class="min-w-0">
    <Space :size="32">
      <Countdown
        title="跨天任务"
        :value="now + 26 * 60 * 60 * 1000"
        :now="now"
        format="D 天 HH:mm:ss" />
      <Countdown
        title="紧急窗口"
        :value="now + 90 * 1000"
        :now="now"
        prefix="T-"
        suffix=" remaining" />
    </Space>
  </div>
</template>
